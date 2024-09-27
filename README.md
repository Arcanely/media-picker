# Media Picker

https://github.com/user-attachments/assets/cb45ba8c-40b1-4ff6-b970-b05fe2803a39

## Installation

### Install via NPM

Get the package

```bash
npm i --save-dev @stegopop/media-picker
```

```bash
yarn add -D @stegopop/media-picker
```

### Load from CDN

You can use package from jsDelivr CDN.

```html
<script src="https://cdn.jsdelivr.net/npm/@stegopop/media-picker/dist/media-picker.js"></script>
```

## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
import MediaPicker from "@stegopop/media-picker/dist/media-picker";

var editor = EditorJS({
  ...
 
  /**
   * Tools list
   */
  tools: {
    mediaPicker: {
      class: MediaPicker,
      config: {
        endpoint: 'https://localhost:8080/api/media/search',
        queryParam: 'search',
        pageParam: 'page',
      }
    }
  },
  
  ...
});
```

## Config Params

Search requests will be sent to the server by `GET` requests with 2 query string params. One for searching, and another for paging. 

List of server connection params which may be configured.

| Param        | Required | Default  | Description                                           |
|--------------|----------|----------|-------------------------------------------------------|
| `endpoint`   | Yes      | null     | URL of the server's endpoint for getting image media. |
| `queryParam` | No       | 'search' | Param name to be sent with the search string.         |
| `pageParam`  | No       | 'page'   | Param name to be sent with the page string.           |


## Server response data format

For endpoint requests server must answer with a JSON containing following properties:

- `success` (`boolean`) — state of processing: `true` or `false`  
- `files` (`{url: string, alt: string|null, filename: string, extension: string}`) — an array of found files. Each file *must* contain a `url`, `filename`, and `extension` params.
- `page` (`int`) - the current page.
- `totalPages` (`int`) - the total number of pages resulting from the search.

Content-Type: `application/json`.

```json
{
  "success": true,
  "files": [
    {
      "url": "https://localhost:8080/url/to/your/image.webp",
      "alt": null,
      "filename": "image",
      "extension": "webp"
    },
    {
      "url": "https://localhost:8080/url/to/your/image2.png",
      "alt": null,
      "filename": "image2",
      "extension": "png"
    }
  ],
  "page": 1,
  "totalPages": 1
}
```

## Output data

Everything you need to render the image will be in the output data. You may use this data to create your own html, or use the `html` or `htmlWithCaption` that are also provided.

```json
{
    "type" : "mediaPicker",
      "data" : {
          "src" : "https://localhost:8080/url/to/your/image.webp",
          "alt" : "",
          "filename" : "image",
          "extension" : "webp",
          "caption" : "My caption.",
          "html" : "<img class=\"mediapicker-image\" src=\"https://localhost:8080/url/to/your/image.webp\" alt=\"\" data-filename=\"20230205_142334\" data-extension=\"webp\">",
          "htmlWithCaption" : "<figure class=\"mediapicker-figure\"><img class=\"mediapicker-image\" src=\"https://localhost:8080/url/to/your/image.webp\" alt=\"\" data-filename=\"image\" data-extension=\"webp\"><figcaption>My caption.</figcaption></figure>"
      }
}
```

## I18n

There are a few phrases to be translated. 

UI items:

- `Media Library` - The name of the tool in the editor menu.
- `Search` — Placeholder for the search input field.
- `Caption` — Placeholder for the caption input field.
- `View Details` - Tooltip text when hovering over the library preview expand button.
- `Select New File` - Tooltip text when hovering over the replace button after selecting an image.
- `tab` - The text inside the tab key when a caption has pulled a suggestion from available alt text.
- `Filename` - A label in the expanded preview to show details about the file.
- `Alt Text` - A label in the expanded preview to show details about the file.
- `First` - Button text for going back to the first page.
- `Last` - Button text for going to the last page.

Error messages:

- `Cannot process search request because of` — Message before error's text in notification for a bad server response.
- `Server responded with invalid data` — Notification text for a bad server response.

```
i18n: {
  messages: {
    toolNames: {
      "Media Picker": "Image Select"
    },
    tools: {
      "mediaPicker": {
        'Search': 'Buscar',
        'Caption': 'Subtítulo',
        'View Details': 'Ver Detalles',
        'Select New File': 'Seleccionar nuevo archivo',
        'tab': 'Tab',
        'Filename': 'Nombre del archivo',
        'Alt Text': 'Texto alternativo',
        'First': 'Primera',
        'Last': 'Última',
        'Cannot process search request because of': 'No se puede procesar la solicitud de bùsqueda debido a',
        'Server responded with invalid data': 'El servidor respondió con datos no válidos',
      }
    }
  }
},
```
