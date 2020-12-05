
example sheet:
https://data.2x2.graphics/12z4r0EnA0GQIrVWa1s9gqEu79ZJx9ql0twrvIieNUYA.json

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
Adding ` -nopub` to the end of a sheet name will stop it from being published
e.g. `home addresses -nopub`

adding ` -config` to the end of a sheet name will produce a object of keys and values from the first 2 columns

e.g.
`appdata -config`
might look like this..

```csv
"colour", "red"
"number",	"7"
"coins.list",	"1p,2p,5p,10p,20p,50p,£1,£2"
```

and will produce
```json
"appdata":{
  colour: "red",
  number: "7",
  coins: ["1p","2p","5p","10p","20p","50p","£1","£2"]
}
```

note that `something.list` in the key column results in an array