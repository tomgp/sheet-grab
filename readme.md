# Get google spreadsheets

The idea here is to provide a dead simple JSON interface to google sheets where the sheet creator has some control over structure beyond just an array of objects.

To publish a sheet you share it with the appropriate google account and then it'll become available at
https://data.2x2.graphics/{MY_GOOGLE_SHEET_ID}.json.

TODO
 [] allow rows to be hidden
 [] lru cache

example sheet:
https://data.2x2.graphics/12z4r0EnA0GQIrVWa1s9gqEu79ZJx9ql0twrvIieNUYA.json

I'm running this off a basic Digital Ocean droplet using [pm2](https://pm2.keymetrics.io)

--

## Column conventions
columns named...
`thing.one` and `thing.two` will  create a structure int he resulting JSON like
```json

"thing":{
  "one":"value",
  "two":"value"
}
```

columns named `thing.list` with row contents separated by commas will
will result in 
```json
"thing":[ "a","b","c" ]
```

## Sheet conventions

### nopub

Adding ` -nopub` to the end of a sheet name will stop it from being published
e.g. `home addresses -nopub`

Adding ` -config` to the end of a sheet name will produce a object of keys and values from the first 2 columns


### config

e.g.
`appdata -config`
might look like this..

```csv
"colour","red"
"number","7"
"coins.list","1p,2p,5p,10p,20p,50p,£1,£2"
```

and will produce
```json
"appdata":{
  "colour": "red",
  "number": "7",
  "coins": ["1p","2p","5p","10p","20p","50p","£1","£2"]
}
```

note that `something.list` in the key column results in an array

### array
Adding `-array` to your sheet will give you an array of arrays 
so
```csv
1,2,3
a,b,c
i,ii,ii
```
becomes
```json
[
  [1,2,3],
  ["a","b","c"],
  ["i","ii","iii"]
]
```

--

## Implementation details

The core of the project is an __express__ server with __helmet__ for a bit of security. Dealing with googles API is handled by the __google-spreadsheet__ npm module. As it stands there's not caching on the server, instead it sits behind Cloudflare.
