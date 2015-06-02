# Architecture of Metadataplayer #

WARNING !
This documentation refers to the latest version of Metadataplayer, available in the **default** branch in our repository
http://www.iri.centrepompidou.fr/dev/hg/metadataplayer

## External Libraries ##

External libraries are bundled in the *src/libs* directory

### LAB.js ###

- **File**: LAB.min.js
- **License**: MIT.
- **Role**: Loads other librairies and widgets.
- **Used in**: Metadataplayer core.
- As LAB.js is used to load other libraries, it’s the only library called before loading the Metadataplayer core.
- **Library homepage**: http://labjs.com/

### jQuery ###

- **File**: jquery.min.js
- **License**: Double, MIT and GPL.
- **Role**: Manages HTML document (DOM) access and Ajax calls.
- **Used in**: Metadataplayer core and all widgets.
- **Library homepage**: http://jquery.org/

### jQuery UI ###

- **Fichiers**: jquery-ui.min.js and jquery-ui.css
- **License**: Double, MIT and GPL.
- **Role**: Manages User Interface elements, such as *Sliders*
- **Used in**: Widgets : Controller (for volume control) et Slider (Time *progress slider*)
- **Library homepage**: http://jqueryui.com/

### Underscore ###

- **File**: underscore-min.js
- **License**: MIT.
- **Role**: Adds functional-programming facilities to handle objects, arrays and functions.
- **Used in**: Metadataplayer core and most widgets.
- **Library homepage**: http://underscorejs.org/

### Popcorn ###

- **File**: popcorn-complete.min.js
- **License**: MIT.
- **Role**: Handles HTML5 Video Playback.
- **Used in**: HTML5 and Youtube video players. Also handles Metadataplayer events when one of these players is used.
- **Library homepage**: http://popcornjs.org/

### Mustache ###

- **File**: mustache.js
- **License**: MIT.
- **Role**: A templating library to generate HTML code.
- **Used in**: widgets.
- **Library homepage**: http://mustache.github.com/

### Raphael ###

- **File**: raphael-min.js
- **License**: MIT.
- **Role**: A vectorial drawing interface (using SVG or VML depending on browsers)
- **Used in**: Arrow and Sparkline widgets
- **Library homepage**: http://raphaeljs.com/

### ZeroClipboard ###

- **Files**: ZeroClipboard.js and ZeroClipboard.swf
- **License**: MIT.
- **Role**: Manages access to the Clipboard (using Flash)
- **Used in**: Social widget
- **Library homepage**: http://code.google.com/p/zeroclipboard/

### ktbs4js Tracemanager ###

- **File**: tracemanager.js
- **License**: LGPL.
- **Role**: Interface with the KTBS trace management system, created by Olivier Aubert (Liris)
- **Used in**: Trace widget
- **Library homepage**: http://github.com/oaubert/ktbs4js

## Metadataplayer core ##

In Metadataplayer, Javascript and CSS files are divided in *core* and *widgets*.

In the release (compiled) version, the JS part of the core is a single file, *LdtPlayer-core.js* compiled by concatenating JS files located dans *src/js*:

### header.js ###

Contains credits and licence information (The license is CEA, CNRS and Inria’s *CeCILL-C*)

### LAB.js ###

see *external libraries*.

### init.js ###

Defines the *IriSP* object, used as a namespace for the whole Metadataplayer.
Contains the declaration and methods of the *IriSP.Metadataplayer* class, whose instantiation is the main entry point for the code.

### pop.js ###

Defines the *IriSP.PopcornReplacement* class, i.e. a simplified version of the Popcorn API used to interface with video players (jwplayer, dailymotion) not supported by Popcorn.
When this part of the Metadataplayer was written, Popcorn and jwplayer didn’t interface well, but it should be replaced by a real Popcorn.js plugin.

### utils.js ###

Contains some utility functions such as *IriSP.loadCss*, an equivalent to LAB.js for CSS files.

### model.js ###

Contains classes managing the Cinelab data model, grouped in the *IriSP.Model* namespace.

### widgets.js ###

Contains the (abstract) class *IriSP.Widgets.Widget*, containing base functionalities for all widgets.

### players ###

Players are now widgets. See widget section for their configuration.

### serializers ###

Serializers are converters between the internal data representation in the metadata player and formats used for communication with servers.

Two serializers are available:

1. **ldt**, to read JSON projects provided by the *Lignes de Temps* platform.
2. **ldt\_annotate**, for communications with the Add Widget API, whose format is slightly different.

## Widgets ##

Widgets are modules, visible or not, adding functionalities to the Metadataplayer.

Located in the *src/widgets* directory, they’re composed of a mandatory JavaScript file, *WidgetName.js* and an optional stylesheet, *WidgetName.css*

### Common video player Widget options ###

- **video**, video file URL.
- **height**, video player height (width is defined in the main *config* of IriSP.Metadataplayer(*config*) ).
- **autostart**, as its name implies, *true* or *false*.
- **url\_transform**, function to transform the video url, if a transformation is needed before integration.
    Ex: url\_transform: function(url) { return url + ".mp4"; }

Here is the list of available video player widget with their options. No specific css used.

#### HtmlPlayer ####

- **Role** : pure html5 video player.

#### JwpPlayer ####

- **Role** : interface with JW Player, often useful with rtmp streamed flash urls or mp4 files fallback. Last version delivered : 6.5.3609.

#### PopcornPlayer ####

- **Role** : interface with popcorn player, which enables to read html5, youtube and vimeo videos. Last version delivered : 1.3.
- **Option**:
    - **video**: video file URL or youtube/vimeo page, for example http://www.youtube.com/watch?v=Eb7U-umL5L4 or http://vimeo.com/80887929.

#### DailymotionPlayer ####

- **Role** : interface with the dailymotion player.
- **Option**:
    - **video**: URL of the dailymotion page, for example http://www.dailymotion.com/video/x16kajy.

#### AdaptivePlayer ####

- **Role** : selects JwpPlayer or HtmlPlayer depending of the url.

#### AutoPlayer ####

- **Role** : select the appropriate player depending of the url among all the available players. For example rtmp leads to JwpPlayer, youtube to PopcornPlayer, webm to HtmlPlayer, etc.

#### PlaceholderPlayer ####

- **Role** : Placeholder, does not read any video.

#### HtmlMashupPlayer ####

- **Role** : Enables to read mashup "bout à bout" of html5 videos.

#### MashupPlayer ####

- **Role** : Enables to read mashup "bout à bout" of html5 videos.


### Common Widget Options ###

- **metadata**, metadata source, as an object with the following properties: { url: *URL of the data source*, type: *Serializer type* }
- **container**, used to position the widget in a given HTML element, given its ID. If omitted, the widget will be automatically aligned vertically below the player.
- **annotation\_type**, in widgets displaying annotations. This option can have the following values:
    - *String*: will display widgets whose annotation type title includes the string. Example: "segments" will show annotations whose annotation type have a title with "Segments" in it.
    - *Array of string*: to display several annotation types. Example: "Segments"
    - *false*: to display all annotations related to the media.

Here’s a list of available widgets:

#### Annotation ####

- **Role**: Displays information relative to a single segment/annotation while it is being played
- **Options**:
    - **annotation\_type**: (default: "chapitrage"), see *Common widget options*.
    - **show\_top\_border**: (default: false), show top widget border (useful depending on whether it is used in combination with the *Arrow* widget)
    - **site\_name**: "Lignes de Temps", site name to display when users click on "Share on social networks".
- Uses a CSS stylesheet: yes

#### AnnotationsList ####

- **Role**: Show a list of annotations.
- **Options**:
    - **ajax\_url**: (default: false), specifies an API template when annotations have to be loaded from an external source. In the URL, {{media}} will be replaced by the media ID, {{begin}} by the start *timecode* in milliseconds, {{end}} by the end *timecode* in milliseconds. If set to *false*, displayed annotations will be the ones loaded from the default metadata source. On the *Lignes de Temps*, the URL of the segments API is http://ldt.iri.centrepompidou.fr/ldtplatform/api/ldt/segments/{{media}}/{{begin}}/{{end}}?callback=?
    - **ajax\_granularity**: (default: 300000 ms = 5 minutes), specifies the timespan to be loaded from the segment API, around the current timecode. 
    - **default\_thumbnail**: thumbnail to display when an annotation doesn’t have one.
    - **foreign\_url**: Specifies an URL template for when an annotation doesn’t have an URL and is not in the current project. In that template, {{media}} will be replaced by the media ID, {{project}} by the project ID, {{annotationType}} by the annotation type ID and {{annotation}} by the annotation ID. For the *Lignes de temps* platform, this URL is http://ldt.iri.centrepompidou.fr/ldtplatform/ldt/front/player/{{media}}/{{project}}/{{annotationType}}#id={{annotation}}
    - **annotation\_type**: (default: false), see *Common widget options*, above
    - **refresh\_interval**: (default: 0), Ajax refresh interval, to get annotations added while watching (works with either the default source or the external segment API)
    - **limit\_count**: (default: 10), Maximum number of annotations to display at once.
    - **newest\_first**: (default: false), When *true*, annotations are sorted by decreasing creation date. When *false*, annotations are sorted by increasing timecode.
- Uses a CSS stylesheet: yes

#### Arrow ####

- **Role**: Draws the position arrow showing where the annotation is.
- **Options**:
    - **arrow\_height**: (default: 16), arrow height in pixels
    - **arrow\_width**: (default: 24), arrow width in pixels
    - **base\_height**: (default: 0), distance between arrow bottom and widget button. Mandatory for a rounded widget.
    - **base\_curve**: (default: 0), curvature radius in pixels for a rounded widget.
    - **fill\_url**: fill image URL.
    - **fill\_color**: (default: "#ffffff" = white), fill color. Can be replaced by a gradient described by : gradient angle-start color-end color, e.g.: "90-#000-#fff"
    - **stroke\_color**: (default: "#b7b7b7" = grey), border color.
    - **stroke\_width**: (default: 1.5), border width.
    - **animation\_speed**: (default: 20), arrow animation speed.
    - **pilot\_widget**: (default: "Annotation"), widget driving the arrow position.
- Uses external library: Raphael
- Uses a CSS stylesheet: no

#### Controller ####

- **Role**: Play, Pause, Search, Annotate buttons and volume control
- **Options**:
    - **disable\_annotate\_btn**: (default: false), disables Annotate button if set to *true*
    - **disable\_search\_btn**: (default: true), disables Search button
- Uses external library: jQuery UI
- Uses a CSS stylesheet: yes

#### CreateAnnotation ####

- **Role**: Displays a form to create a new annotation
- **Options**:
    - **after\_send\_timeout**: (default: 0), add annotation request timeout.
    - **always\_visible**: (default: false), widget always visible or not.
    - **annotation\_type**: (default: "Contributions"), see *Common widget options*.
    - **api\_endpoint\_template**: API Endpoint URL, with {{id\}\} as a placeholder for project ID, e.g.: "http://ldt.iri.centrepompidou.fr/ldtplatform/api/ldt/annotations/{{id}}.json".
    - **api\_method**: (default: "POST"), HTTP method used to send annotations.
    - **api\_serializer**: (default: "ldt\_annotate"), serializer to use when sending annotations.
    - **close\_after\_send**: (default: false), closes the widget after adding annotation.
    - **close\_widget\_timeout**: (default: 0), duration in milliseconds before widget is closed after send. If value is set to 0, the widget stays open.
    - **creator\_avatar**: Creator profile thumbnail URL.
    - **creator\_name**: Default annotation creator name.
    - **max\_tags**: (default: 8), maximum number of tags to display.
    - **pause\_on\_write**: (default: true), pauses video when we start to write.
    - **polemics**: polemic buttons to display, as an array of objects, e.g.: [ { keyword: "++", background\_color: "#00a000", text\_color: "#ffffff" } ]
    - **show\_title\_field**: (default: true), shows or hides the annotation title field.
    - **show\_creator\_field**: (default: true), shows or hides the annotation author field.
    - **start\_visible**: (default: true), widget visible at start.
    - **tag\_prefix**: (default: "#"), as its name implies.
    - **tag\_titles**: (default: false), list of tags to display, as an array of strings: [ "#firstTag", "#secondTag" ]
    - **tags**: (default: false), list of tags to display, as an array of objects: [ { id: "tag-001", title: "#firstTag" } ]. Overrides *tag\_titles*. If both options are set to *false*, the most frequent tags in the project will be displayed.
- Uses a CSS stylesheet: yes

#### HelloWorld ####

- **Role**: Example widget demonstration the API capabilities
- **Options**:
    - **text**: (default: "world"), text to display after "Hello, "
- Uses a CSS stylesheet: yes

#### MediaList ####

- **Role**: Shows current media, as well as other medias in the project. Mostly used for mashups
- **Options**:
    - **default\_thumbnail**: thumbnail to display when a media doesn’t have one
    - **media\_url\_template**: Specifies an URL template for when a media doesn’t include URL information, e.g.: "http://ldt.iri.centrepompidou.fr/ldtplatform/ldt/front/player/{{media}}/"
- Uses a CSS stylesheet: yes

#### Mediafragment ####

- **Role**: Handles *Media fragments*-compliant URIs (W3C Recommandation): Changing the playing position changes the URL and vice-versa.
- An URL ending with #id=*annotation ID* points to an annotation, one with #t=*time in seconds* to a precise position.
- No options
- Uses a CSS stylesheet: no

#### MultiSegments ####

- **Rôle**: Displays horizontaly all the media's *annotation\_type* as Segments.
- **Options**:
    - **visible_by_default**: true by default or false, as its name implies.
- Utilise un fichier CSS: non

#### Polemic ####

- **Role**: Shows the *polemical timeline*, i.e. tweets colored according to the polemical syntax. Depending on the number of tweets, two visualization modes exist:
    - Below the threshold (low volume mode), tweets are represented as individual squares.
    - Above the threshold, columns show aggregated numbers of tweets by color.
- **Options**:
    - **element\_width**: (default: 5), width in pixels of a tweet column.
    - **element\_height**: (default: 5), height in pixels of a tweet, in low volume mode.
    - **max\_elements**: (default: 15), threshold between low and high volume mode, in tweets per column.
    - **annotation\_type**: (default: "tweet"), see *Common widget options*.
    - **defaultcolor**: (default: "#585858" = grey), default color for tweets with no polemical coloring.
    - **foundcolor**: (default: "#fc00ff" = magenta), color for tweets in a search result.
    - **polemics**: polemical colors to display, as an array of objects, e.g. [ { name: "OK", keywords: [ "++" ], color: "#1D973D" } ]
- Uses a CSS stylesheet: yes

#### Renkan ####

- **Role**: Interface with the *Renkan* project.
- Uses external libraries: jQuery Mousewheel, Backbone, Backbone Relational, Renkan-Publish
- Uses a CSS stylesheet: oui

#### Segments ####

- **Role**: Displays segments of a media as rectangles on an horizontal line.
- **Options**:
    - **colors**: colors to use when annotations don’t have colour metadata.
    - **height**: height of the widget, in pixels
- Uses a CSS stylesheet: yes

#### Slider ####

- **Role**: A combination of a Progress bar and a Slider displaying and allowing repositioning of the current video playback position.
- **Options**:
   - **minimized\_height**: (default: 4), height in pixels of the *Slider* in minimized mode
   - **maximized\_height**: (default: 10), height in pixels du *Slider* in maximized mode (on mouseover)
   - **minimize\_timeout**: (default: 1500), duration in milliseconds before the *Slider* is automatically minimized. If set to 0, *Slider* stays maximized.
- Uses external library: jQuery UI
- Uses a CSS stylesheet: yes

#### Social ####

- **Role**: Adds buttons to share an URL on social networks
- **Options**:
    - **text**: displays a text
    - **url**: the URL to share
    - **show_url**: Shows a button to copy/paste an URL
    - **show_twitter**: Shows a button to share on Twitter
    - **show_fb**: Shows a button to share on Facebook
    - **show_gplus**: Shows a button to share on Google+
    - **show_mail**: Shows a button to share by e-mail
- Uses a CSS stylesheet: yes
- Uses external library: ZeroClipboard

#### Sparkline ####

- **Role**: Displays a curve showing the volume of tweets across time.
- **Options**:
    - **annotation\_type**: see *Common widget options*, above
    - **lineColor**: (default: "#7492b4" = blue-grey), line color
    - **fillColor**: (default: "#aeaeb8" = grey), color of the surface below the curve
    - **lineWidth**: (default: 2), line width in pixels
    - **slice\_count**: (default: 20), number of slices used to sample volumes
    - **height**: (default: 50), curve height
    - **margin**: (default: 5), margin above the curve
- Uses external library: Raphael
- Uses a CSS stylesheet: no

#### Tagcloud ####

- **Role**: Shows a tag cloud - WARNING: Doesn’t work well with Japanese language because of word splitting issues
- **Options**:
    - **include\_titles**: (default: true), includes annotation titles when computing tag cloud.
    - **include\_descriptions**: (default: true), includes annotation descriptions when computing tag cloud.
    - **include\_tag\_texts**: (default: true), includes tags in annotations when computing tag cloud.
    - **tag\_count**: (default: 30), maximum number of tags to display.
    - **stopword\_language**: (default: "fr"), language code for the stopword list.
    - **custom\_stopwords**: (default: []), custom stopwords to filter out.
    - **exclude\_pattern**: (default: false), regexp to filter out.
    - **annotation\_type**: (default: false), see *Common widget options*, above. The annotation type of the annotations whose text is extracted to compute the cloud.
    - **segment\_annotation\_type**: (default: false), defines a segmentation of the tag-cloud, so as to display a distinct tag cloud for each segment of this annotation type. When set to *false*, a single tag cloud is created for the whole media.
    - **min\_font\_size**: (default: 10), font size for the most frequent word.
    - **max\_font\_size**: (default: 26), font size for the least frequent word.
- Uses a CSS stylesheet: yes

#### Tooltip ####

- **Role**: Displays a tooltip. Is mainly used as a subwidget, embedded and called from another widget.
- No options
- Uses a CSS stylesheet: yes

#### Trace ####

- **Role**: Sends traces to the KTBS server.
- **Options**:
    - **js\_console**: (default: false), shows logs in the browser console.
    - **url**: (default: "http://traces.advene.org:5000/"), URL of the trace server
    - **requestmode**: (default: "GET"), HTTP method used to send traces (only *"GET"* allows *cross-domain* sending).
    - **syncmode**: (default: "sync"), allows traces to be sent grouped (*"delayed"* mode) or as single events (*"sync"*).
- Uses external library: ktbs4js tracemanager
- Uses a CSS stylesheet: no

#### Tweet ####

- **Role**: Show the contents on a tweet when clicked (in Polemic Widget)
- **Options**:
    - **hide_timeout**: (default: 5000), time (in milliseconds) before hiding the Tweet.
    - **polemics**: See *Polemic* widget
