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

### Key ###

The `key` means Google Chrome storage's access key. I suggest use simple and short word to key.

### Regex ###

The `regex` means regular expression to check website's URL. Http(s) protocol are unnecessary. Also, `regex` should cover whole url without document name.

For example, English Wikipedia's document url is `https://en.wikipedia.org/wiki/Wikipedia`. In this case, `regex` should be `/en\.wikipedia\.org\/wiki\//`.

### Url ###

`url` means raw text of regex without any special regex character.

For example, if `regex` is `/en\.wikipedia\.org\/wiki\//`, `url` should be `en.wikipedia.org/wiki/`.

Also, if site has language code inside of its url, you can use language parameter `%l`.

For example, to support multiple languages for Wikipedia, `url` should be `%l.wikipedia.org/wiki/`. (**DO NOT** forget set `regex` to `/[a-z][a-z]\.wikipedia\.org\/wiki\//` to include language code)

### ExLang (Optional) ###

`exLang` means regex which extract language code from url. It is necessary if you add langauge parameter `%s` in the `url`.

For example, Wikipedia's url is `https://{langCode}.wikipedia.org/wiki/SOME-DOCUMENT`. In this case `exLang` should be `/\.wikipedia\.org\/wiki\/.+/`. This regex exclude only language code like **en**, **ko**, etc.

## Add site-specific css ##

Add site-specific css file to `core/styles`. File name must same as `siteValues`'s key name.

## Add site url to manifest.json

Add site url to manifest.json's `host_permissions` section.