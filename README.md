# Scrapyard

This is a small tool, created for easy web scrap websites, the main goal for this tool is to export content from simple pages where you cannot performe the action from the admin panel or database access.

### The configuration

To run it you only need to create a json file like this one:

```json
{
  "baseUrl": "https://www.web-to-scrap.com",
  "dataSource": {
    "url": "https://www.web-to-scrap.com/path/other-path/?page={page}",
    "elements": {
      "page": [1, 2, 3, 4]
    },
    "selector": ".list-itme .with-pagination-to-get-links"
  },
  "language": {
    "default": "en",
    "aditional": {
      "es": "link[hreflang='en']/attr:href",
      "fr": "link[hreflang='fr']/attr:href"
    }
  },
  "scrapData": {
    "_slug": "\\/([0-9a-zA-Z\\-]*)$",
    "image": ".picture__picture > img/attr:src",
    "title": ".page-header h1/text",
    "content": ".page__content .content/html"
  }
}
```

- **baseUrl**: To complete the urls starting with slash "/"

- **dataSource.url**: The pagination url where you want to get all the elements, whte {page} part will be replaced with **elements.page**

- **dataSourde.elements.page**: The pages to request, can be a an array with all the elements you want, or can be a string range "1-11" or "7-21"...

- **dataSource.selector**: The selector where the URL of the individual elements in the paginaed list

- **language.default**: The default language you want to set in the output json

- **language.aditional**: Aditional languages you want to add to the scrap, you can add as many as you want

- **scrapData**: The data structure you want to exprt, and theis selector to get the information, the \_ elements would refer to the url, so you can perform a regex to get the part of the url you want, aditionally a url element will be added with the original requested url.

### The Custom Selector

The selectors as you can see have a extra payload with more information

**.css-selector > .you-want > to use** / **text|html|attr:href**

The first part references the css selectro, pretty common and then you can add a slash, and concat text, html or attr, the las element must have a second part separated with **:** to specify the attr you want to select **attr:data-id**, **attr:href**, **attr:class**...

### How to run it

```shel
node index.js config/test.json
```
