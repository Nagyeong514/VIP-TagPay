import time
import board
import busio
import serial
from digitalio import DigitalInOut
import smbus2 as smbus
from adafruit_pn532.uart import PN532_UART
import ndef
import re
from urllib.parse import urlparse, parse_qs, unquote
import sys
import termios
import tty

# LCD1602 클래스 (I2C 기반 16x2 LCD 제어용)
class LCD1602:
    def __init__(self, pi_rev=2, i2c_addr=0x27, backlight=True):
        self.addr = i2c_addr
        self.width = 16
        self.backlight = 0x08 if backlight else 0x00
        self.bus = smbus.SMBus(1 if pi_rev == 2 else 0)
        self.init_display()

    def init_display(self):
        # LCD 초기화 명령어 순서
        for cmd in [0x33, 0x32, 0x06, 0x0C, 0x28, 0x01]:
            self.send(cmd, 'cmd')
        time.sleep(0.5)

    def send(self, data, cmd_type='data'):
        mode = 0x00 if cmd_type == 'cmd' else 0x01
        high = mode | (data & 0xF0) | self.backlight
        low = mode | ((data << 4) & 0xF0) | self.backlight
        for bits in [high, low]:
            self.bus.write_byte(self.addr, bits)
            self.toggle(bits)

    def toggle(self, bits):
        self.bus.write_byte(self.addr, bits | 0x04)
        time.sleep(0.001)
        self.bus.write_byte(self.addr, bits & ~0x04)
        time.sleep(0.001)

    def display(self, text, line=1):
        line_addr = {1: 0x80, 2: 0xC0}.get(line, 0x80)
        self.send(line_addr, 'cmd')
        for char in text.ljust(self.width, " "):
            self.send(ord(char), 'data')

    def clear(self):
        self.send(0x01, 'cmd')

# LCD 인스턴스 생성
lcd = LCD1602()

# PN532 UART 초기화
uart = serial.Serial("/dev/serial0", baudrate=115200, timeout=1)
pn532 = PN532_UART(uart, debug=False)
pn532.SAM_configuration()

# 은행 코드 맵핑
BANK_OPTIONS = {
    '1': 'KB', '2': 'WOORI', '3': 'SHINHAN', '4': 'HANA',
    '5': 'NH', '6': 'IBK', '7': 'SC', '8': 'CITI',
    '9': 'BUSAN', '10': 'DGB(IM Bank)', '11': 'GWANGJU', '12': 'JB',
    '13': 'JEJU', '14': 'KAKAO', '15': 'K BANK', '16': 'SUHYUP'
}

# LCD에 두 줄 출력 함수
def lcd_print(line1="", line2="", duration=2):
    lcd.clear()
    lcd.display(line1[:16], 1)
    lcd.display(line2[:16], 2)
    if duration > 0:
        time.sleep(duration)

# NFC 태그 대기 함수
def wait_for_tag():
    lcd_print("Tap your tag", "", 0)
    for _ in range(20):
        uid = pn532.read_passive_target(timeout=0.5)
        if uid:
            return uid
    lcd_print("No tag found", "", 2)
    return None

# URI를 NFC 태그에 쓰기
def write_ndef_message(uri):
    uid = wait_for_tag()
    if not uid:
        return False

    record = ndef.UriRecord(uri)
    ndef_message = b''.join(ndef.message_encoder([record]))

    tlv_message = bytearray()
    tlv_message.append(0x03)
    tlv_message.append(len(ndef_message))
    tlv_message.extend(ndef_message)
    tlv_message.append(0xFE)

    chunks = [tlv_message[i:i+4] for i in range(0, len(tlv_message), 4)]
    if len(chunks[-1]) < 4:
        chunks[-1] += b'\x00' * (4 - len(chunks[-1]))

    page = 4
    for chunk in chunks:
        result = pn532.ntag2xx_write_block(page, list(chunk))
        if not result:
            print(f"Write failed at page {page}")
            lcd_print("Write failed", f"Page {page}", 2)
            return False
        page += 1

    # 이후 페이지 초기화
    for p in range(page, 40):
        pn532.ntag2xx_write_block(p, [0x00, 0x00, 0x00, 0x00])

    lcd_print("Write Success", "", 2)
    return True

# NFC 태그에서 URI 읽기
def read_ndef_message():
    uid = wait_for_tag()
    if not uid:
        return None

    data = b''
    for page in range(4, 40):
        block = pn532.ntag2xx_read_block(page)
        if block is None:
            break
        data += bytes(block)

    try:
        start_index = data.find(0x03)
        if start_index == -1:
            lcd_print("NDEF Start Not Found", "", 2)
            return None

        length = data[start_index + 1]
        ndef_msg = data[start_index + 2 : start_index + 2 + length]

        records = list(ndef.message_decoder(ndef_msg))
        for record in records:
            if isinstance(record, ndef.UriRecord):
                uri = record.uri
                print(f"NDEF URL: {uri}")
                return uri

    except Exception as e:
        print(f"NDEF Decode Error: {e}")
        lcd_print("NDEF Decode Err", "", 2)
    return None

# 은행 선택 화면
def select_bank():
    while True:
        for i in range(1, 17, 4):
            b1 = BANK_OPTIONS.get(str(i), "")
            b2 = BANK_OPTIONS.get(str(i+1), "")
            b3 = BANK_OPTIONS.get(str(i+2), "")
            b4 = BANK_OPTIONS.get(str(i+3), "")
            lcd_print(f"{i}:{b1} {i+1}:{b2}", f"{i+2}:{b3} {i+3}:{b4}", 2)

        lcd_print("Select Bank:", "Enter 1~16", 0)
        input_str = ""
        while True:
            k = getch()
            if k.isdigit():
                if len(input_str) < 2:
                    input_str += k
                    lcd_print("Select Bank:", input_str, 0)
            elif ord(k) == 127 or k == '\b':  # 백스페이스
                input_str = input_str[:-1]
                lcd_print("Select Bank:", input_str, 0)
            elif k == '\r' or k == '\n':  # 엔터
                if input_str in BANK_OPTIONS:
                    return BANK_OPTIONS[input_str]
                else:
                    lcd_print("Invalid Input", "", 2)
                    break

# URL 파싱 함수
def parse_url(url):
    try:
        url = unquote(url)
        parsed_url = urlparse(url)
        query = parsed_url.query
        params = parse_qs(query)
        bank = params.get('bank', [''])[0]
        account = params.get('account', [''])[0]
        amount = params.get('amount', [''])[0]
        return bank, account, amount
    except Exception as e:
        print(f"URL parsing error: {e}")
        return "", "", ""

# 한 글자 입력 받는 함수 (tty 비표준 모드)
def getch():
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        ch = sys.stdin.read(1)
        return ch
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)

# 허용된 키 중에서만 입력 받기
def get_single_key(valid_keys):
    while True:
        k = getch()
        if k in valid_keys:
            return k

# 숫자 문자열 입력 받기
def get_string_input(prompt):
    input_str = ""
    lcd_print(prompt, input_str, 0)
    while True:
        k = getch()
        if k.isdigit():
            if len(input_str) < 16:
                input_str += k
                lcd_print(prompt, input_str, 0)
        elif ord(k) == 127 or k == '\b':
            input_str = input_str[:-1]
            lcd_print(prompt, input_str, 0)
        elif k == '\r' or k == '\n':
            return input_str

# 새로운 결제 태그 생성
def save_info():
    bank = select_bank()
    lcd_print("Bank:", bank, 2)

    account = get_string_input("Enter Account:")
    lcd_print("Account:", account, 2)

    amount = get_string_input("Enter Amount:")
    lcd_print("Amount:", amount, 2)

    url = f"https://example.com/pay?bank={bank}&account={account}&amount={amount}"
    print("NDEF URL:", url)

    write_ndef_message(url)

# 기존 태그의 금액만 수정
def update_amount_only():
    lcd_print("Read existing", "tag first", 2)
    url = read_ndef_message()
    if not url:
        lcd_print("No saved data", "", 2)
        print("No saved data found on tag")
        return

    bank, account, old_amount = parse_url(url)

    lcd_print("Bank:", bank, 2)
    lcd_print("Account:", account[:16], 2)

    amount = get_string_input("Enter New Amount:")
    lcd_print("Amount:", amount, 2)

    new_url = f"https://example.com/pay?bank={bank}&account={account}&amount={amount}"
    print("New NDEF URL:", new_url)

    write_ndef_message(new_url)

# 태그의 결제 정보 읽기
def read_info():
    uri = read_ndef_message()
    if uri:
        bank, account, amount = parse_url(uri)
        lcd_print("Bank:", bank, 2)
        lcd_print("Account:", account[:16], 2)
        time.sleep(2)
        lcd_print("Amount:", amount, 2)
    else:
        lcd_print("Read Fail", "", 2)

# 메인 메뉴 루프
def main_menu():
    while True:
        lcd_print("1.Save 2.Update", "3.Read 4.Exit", 0)
        choice = get_single_key(['1','2','3','4'])

        if choice == '1':
            save_info()
        elif choice == '2':
            update_amount_only()
        elif choice == '3':
            read_info()
        elif choice == '4':
            lcd_print("Exiting...", "", 1)
            break

# 프로그램 시작점
if __name__ == "__main__":
    main_menu()
