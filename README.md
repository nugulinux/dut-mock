# DUT Mock

DUT(Device Under Test) 연동 테스트를 위해 HTTP/2 기반으로 동작하는 가상의 Device Gateway Registry / Device Gateway Server 제공.

## 설치

    git clone https://github.com/nugulinux/dut-mock.git
    cd dut-mock
    npm install

## 실행

### 프로그램 시작

    npm start

`80`포트를 열 수 있는 권한이 있어야 합니다. 일반 계정으로 실패했을 경우 아래와 같이 `sudo`를 사용해서 실행해야 합니다.

    sudo npm start

### 웹브라우저로 접속

디폴트로 3000 포트를 사용하고 있습니다. 아래 주소로 접속하시면 됩니다.

<http://localhost:3000>

### IP 설정

[Registry](http://localhost:3000/registry) 페이지의 Settings - serverPolicies 패널에서 서버 목록에 대해 설정할 수 있습니다.

기본으로 localhost(127.0.0.1)가 server 목록에 설정되어 있습니다. Docker 또는 외부 PC에서 접속하려면 외부에서 접속 가능한 IP 주소(192.xxx, 172.xxx 또는 Public IP address)를 입력해 주시기 바랍니다.

테스트용 가상 서버가 아닌 실제 상용 서버에 연결하고 싶을 경우, 상용 Registry 서버에서 내려주는 serverPolicies JSON파일에서 원하는 서버의 정보를 복사해서 붙여넣으시면 됩니다.

### DUT 설정

NUGU SDK for Linux의 Registry URL 설정을 변경해 주세요.

    export NUGU_REGISTRY_SERVER=http://127.0.0.1

또는,

    export NUGU_REGISTRY_SERVER=http://192.168.0.1

## 종료

`npm start`를 실행했던 터미널에서 <kbd>Ctrl</kbd> + <kbd>C</kbd>를 눌러 종료하시면 됩니다. 프로그램 종료시 실행중인 모든 Gateway Registry와 Gateway Server도 같이 종료됩니다.

## 설정 파일들

### 관리되는 파일들

아래 파일들이 기본 템플릿 용도로 관리되고 있습니다. 프로그램 첫 실행시 아래 파일들을 기반으로 수정 가능한 임시 파일들이 생성됩니다.

| 파일명 | 용도 |
| -- | -- |
| registry/default_config.json | Registry 기본 설정 정보 |
| registry/default_policy.json | Registry 기본 Policy 정보 |
| server/config_default.json | 토큰에 대해 항상 성공(200) 리턴  |
| server/config_reject.json | 토큰에 대해 항상 실패(401) 리턴 |
| server/default_templates.json | Directive 기본 예제 모음 |

### 임시로 생성되는 파일들

| 파일명 | 용도 |
| -- | -- |
| registry/config.json | Registry 설정 정보 |
| registry/policy.json | Registry Policy 정보 |
| server/list.json | 생성한 서버 목록 |
| server/templates.json | Directive 예제 모음 |

## 주의

테스트 목적으로 사용되는 임시 서버이기 때문에, 인증서 없는 H2C(HTTP/2 Cleartext)만 지원하고 있습니다.
