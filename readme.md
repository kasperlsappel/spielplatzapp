# Sonne

## Links

### App

- https://rapidapi.com/apidojo/api/weather338/
- https://dev.to/code_mystery/simple-analog-clock-using-html-css-javascript-2c6a

### Steckdose

- [doku](https://manualzz.com/doc/o/bhjhf/netio4-user-manual-firmv2.3.0-2.5.--actions)
- [anschalten](http://192.168.178.72/event?portnumber=2&state=off)

```js
local msg = "Incoming CGI request ";
local portnumber = tonumber(event.args.portnumber)
local state = event.args.state
msg = msg .. " (portnumber = " .. portnumber .. " ";

if state == "on" then
  msg = msg .. " on )";
  devices.system.SetOut{output=portnumber, value=true}
else
  msg = msg .. " off )";  
  devices.system.SetOut{output=portnumber, value=false}
end

logf("%s", msg);

```