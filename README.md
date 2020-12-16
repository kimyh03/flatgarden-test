# 플랫가든 백엔드 개발자 포지션 입사지원 테스트

- 지원자 김영훈 (kimyh03@gmail.com)
- 최근, 윈도우 업데이트 이후에 가상화 관련 기술(Docker, WSL) 구동시 윈도우부팅 오류가 발생하여 로컬 환경에서 진행했습니다.

___

## Auth

### createUser resolver

- 사용자의 ID 값을 payload로 담은 JWT를 발급합니다.

### assignUser middleware

- HTTP header에서 JWT 추출 후 payload를 이용하여 얻은 user의 정보를 req.user에 등록합니다.

### logInOnly guard

- HTTP header에서 req.user의 존재 유무로 요청 접근을 차단합니다.

### currentUser decorator

- HTTP header에서 얻은 req.user의 값을 반환합니다.

___

## APIs

### createUser

- 사용자를 생성 합니다.
- 이미 존재하는 사용자 이름은 사용할 수 없습니다.
  
### getProfile

- 특정 사용자의 정보를 가져옵니다.
- 해당 사용자가 생성한 게시판의 목록 함께 가져옵니다.
- 존재하지 않는 사용자의 정보는 가져 올 수 없습니다.

### deleteUser

- 사용자 정보를 삭제합니다.
- 로그인 후 이용할 수 있습니다.
- 존재하지 않는 사용자는 삭제할 수 없습니다.

### createBoard

- 게시판을 생성합니다.
- 로그인 후 이용할 수 있습니다.

### getBoardDetail

- 게시판의 정보를 가져옵니다.
- 존재하지 않는 게시판의 정보는 가져 올 수 없습니다.

### searchBoard

- 입력한 검색어에 해당하는(제목 혹은 내용) 게시판의 목록을 가져옵니다.

### editBoard

- 게시판의 내용을 수정할 수 있습니다.
- 게시판을 생성한 사용자만 사용할 수 있습니다.
- 로그인 후 이용할 수 있습니다.
- 존재하지 않는 게시판은 수정할 수 없습니다.

### deleteBoard

- 게시판을 삭제합니다.
- 게시판을 생성한 사용자만 사용할 수 있습니다.
- 로그인 후 이용할 수 있습니다.

___

## Test

- 작성한 모든 resolver에 대한 e2e 테스트를 진행했습니다.
- 각 resolver의 모든 예외 상황에 대한 테스트를 진행했습니다.
- 테스트 결과창을 첨부합니다.

![test result](https://user-images.githubusercontent.com/59421544/102335506-5d3f2200-3fd3-11eb-8f5a-11a9e859036c.jpg)
