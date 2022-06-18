**ENGLISH BELOW**

# 새로운 위키 사이트 추가하기 #

## 사이트 정보 객체 추가 ## 

`src/site_values.json`에 사이트 정보를 담은 객체를 추가합니다. 이 객체에는 `key`과 `regex`의 두 값이 필수적으로 들어있어야 합니다. 각 값에 대한 설명은 아래를 참고하세요.

객체를 추가하고 나면 아래와 같은 형태가 됩니다.
```javascript
{
    "siteValues": [
        ...
        {
            "key": "newSite",
            "regex": "example\\.com"
        }
    ],
    ...
}
```

> 객체는 `background.js`와 `contentscript.js` 양쪽 모두에 추가해야합니다.

### Key ###

`key` 값은 Google Chrome의 저장소 API에 사용됩니다. 짧고 간단한 단어로 설정하는 것을 추천합니다.

### Regex ###

`regex` 값은 웹사이트 URL을 확인하기 위한 정규 표현식입니다. http(s) 부분은 불필요하므로 지워주세요. 이 정규표현식은 문서의 이름 부분을 제외한 전체 URL을 커버할 수 있어야 합니다.

예를 들어, 위키백과 문서의 URL은 `https://ko.wikipedia.org/wiki/SOME-DOCUMENT`입니다. 이 경우, `regex`는 `[a-z]{2}\\.wikipedia\\.org\/wiki\/`가 되어야 합니다.

## 사이트 전용 CSS 추가 (선택사항) ##

`core/styles` 디렉터리 안에 해당 사이트 전용 CSS 파일을 추가해야합니다. 파일 이름은 `siteValues`의 `key`와 동일해야 합니다.

# How to add new website support #

## Add site data object ##

Add site data object into `src/site_values.json`. Data object must have three parameters `key` and `regex`. Explains of parameters are below.

After you added, `src/site_values.json` should be like below,
```javascript
{
    "siteValues": [
        ...
        {
            "key": "newSite",
            "regex": "example\\.com"
        }
    ],
    ...
}
```

> **DO NOT** forget add new object to both scripts `background.js` and `contentscript.js`.

### Key ###

The `key` uses Google Chrome storage's access key. I suggest to use simple and short word to key.

### Regex ###

The `regex` means regular expression to check website's URL. Http(s) protocol are unnecessary. Also, `regex` should cover whole url without document name.

For example, Wikipedia's document url is `https://en.wikipedia.org/wiki/SOME-DOCUMENT`. In this case, `regex` should be `[a-z]{2}\\.wikipedia\\.org\/wiki\/`.

## Add site-specific css (Optional) ##

Add site-specific css file to `core/styles`. File name must same as `siteValues`'s key name.