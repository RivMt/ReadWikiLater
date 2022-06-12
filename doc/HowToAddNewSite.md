**ENGLISH BELOW**

# 새로운 위키 사이트 추가하기 #

## 사이트 정보 객체 추가 ## 

`siteValues`에 사이트 정보를 담은 객체를 추가합니다. 이 객체에는 `key`, `regex`, `url`의 세 값이 필수적으로 들어있어야 합니다. 또한, `exLang`이라는 다국어 지원용 값을 추가할 수 있습니다. 각 값에 대한 설명은 아래를 참고하세요.

객체를 추가하고 나면 아래와 같은 형태가 됩니다.
```javascript
const siteValues = [
    ...
    {
        "key": "newSite",
        "regex": /example\.com/,
        "url": "example.com"
    }
]
```

> 객체는 `background.js`와 `contentscript.js` 양쪽 모두에 추가해야합니다.

### Key ###

`key` 값은 Google Chrome의 저장소 API에 사용됩니다. 짧고 간단한 단어로 설정하는 것을 추천합니다.

### Regex ###

`regex` 값은 웹사이트 URL을 확인하기 위한 정규 표현식입니다. http(s) 부분은 불필요하므로 지워주세요. 이 정규표현식은 문서의 이름 부분을 제외한 전체 URL을 커버할 수 있어야 합니다.

예를 들어, 한국어 위키백과 문서의 URL은 `https://ko.wikipedia.org/wiki/SOME-DOCUMENT`입니다. 이 경우, `regex`는 `/ko\.wikipedia\.org\/wiki\//`가 되어야 합니다.

### Url ###

`url`은 정규 표현식이 나타내는 URL의 실제 모습입니다.

예를 들어, `regex`가 `/ko\.wikipedia\.org\/wiki\//`일 때, `url`은 `ko.wikipedia.org/wiki/`가 되게 됩니다.

또한, 해당 사이트가 언어 코드를 URL에 포함할 때, 언어 파라미터 `%l`을 사용할 수 있습니다.

예를 들어, 위키백과의 여러 언어를 지원하고자 한다면, `url`은 `%l.wikipedia.org/wiki/`의 형태가 되어야 합니다.

> `regex` 역시 `/[a-z][a-z]\.wikipedia\.org\/wiki\//`와 같이 언어 코드를 검사할 수 있도록 설정해야 합니다.

### ExLang (선택 사항) ###

`exLang`은 언어 코드를 포함하고 있는 URL로부터 언어 코드를 추출할 때 사용하는 정규 표현식입니다. `url`이 언어 파라미터 `%l`을 가지고 있을 경우 **필수적으로** 추가해야합니다.

예를 들어, 위키백과의 URL은 `https://{langCode}.wikipedia.org/wiki/SOME-DOCUMENT`와 같은 형태입니다. 이 경우, `exLang`은 `/\.wikipedia\.org\/wiki\/.+/`이 되어야 합니다. 이 정규식은 **en**이나 **ko**와 같은 언어 코드만 추출합니다.

## 사이트 전용 CSS 추가 ##

`core/styles` 디렉터리 안에 해당 사이트 전용 CSS 파일을 추가해야합니다. 파일 이름은 `siteValues`의 `key`와 동일해야 합니다.

## 사이트 URL을 manifest.json에 추가 ##

사이트 URL을 `manifest.json`의 `host_permissions` 섹션에 추가해야 합니다.

# How to add new website support #

## Add site data object ##

Add site data object into `siteValues`. Data object must have three parameters `key`, `regex`, `url`. Also, there is `exLang` which is optional parameter for multiple language support. Explains of parameters are below.

After you added, `siteValues` should be like below,
```javascript
const siteValues = [
    ...
    {
        "key": "newSite",
        "regex": /example\.com/,
        "url": "example.com"
    }
]
```

> **DO NOT** forget add new object to both scripts `background.js` and `contentscript.js`.

### Key ###

The `key` uses Google Chrome storage's access key. I suggest to use simple and short word to key.

### Regex ###

The `regex` means regular expression to check website's URL. Http(s) protocol are unnecessary. Also, `regex` should cover whole url without document name.

For example, English Wikipedia's document url is `https://en.wikipedia.org/wiki/SOME-DOCUMENT`. In this case, `regex` should be `/en\.wikipedia\.org\/wiki\//`.

### Url ###

`url` means raw text of regex without any special regex character.

For example, if `regex` is `/en\.wikipedia\.org\/wiki\//`, `url` should be `en.wikipedia.org/wiki/`.

Also, if site has language code inside of its url, you can use language parameter `%l`.

For example, to support multiple languages for Wikipedia, `url` should be `%l.wikipedia.org/wiki/`.

> **DO NOT** forget to set `regex` to `/[a-z][a-z]\.wikipedia\.org\/wiki\//` to include language code

### ExLang (Optional) ###

`exLang` means regex which extract language code from url. It is necessary if you add langauge parameter `%l` in the `url`.

For example, Wikipedia's url is `https://{langCode}.wikipedia.org/wiki/SOME-DOCUMENT`. In this case `exLang` should be `/\.wikipedia\.org\/wiki\/.+/`. This regex exclude only language code like **en**, **ko**, etc.

## Add site-specific css ##

Add site-specific css file to `core/styles`. File name must same as `siteValues`'s key name.

## Add site url to manifest.json

Add site url to `manifest.json`'s `host_permissions` section.