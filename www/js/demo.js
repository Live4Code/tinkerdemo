/*
    SimpleSerial index.js
    Created 7 May 2013
    Modified 9 May 2013
    by Tom Igoe
*/

var arduino = require('duino');

var app = {
    // macAddress: "F3C7BD5D-34D5-34C8-8B1A-BFBD86569CE4",  // get your mac address from bluetoothSerial.list
    macAddress: "20:13:11:27:70:62",  // get your mac address from bluetoothSerial.list
    chars: "",

/*
    Application constructor
 */
    initialize: function() {
        this.bindEvents();
        console.log("Starting SimpleSerial app");
    },
/*
    bind any events that are required on startup to listeners:
*/
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchend', app.manageConnection, false);
    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        // check to see if Bluetooth is turned on.
        // this function is called only
        //if isEnabled(), below, returns success:
        var listPorts = function() {
            // list the available BT ports:
            bluetoothSerial.list(
                function(results) {
                    app.display(JSON.stringify(results));
                },
                function(error) {
                    app.display(JSON.stringify(error));
                }
            );
						

												
        }

        // if isEnabled returns failure, this function is called:
        var notEnabled = function() {
            app.display("Bluetooth is not enabled.")
        }


        
				 // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );
				
				var board = new arduino.Board({
				  //debug: true,
				  // device: "Live4Code",
				  // //device: "usb",
				  macAddress: app.macAddress
				});
				
				var led = new arduino.Led({
				  board: board,
				  pin: '11'
				});

				var sensor = new arduino.Sensor({
				  board: board,
				  pin: 'A0'
				});
				
				(function() {
				  var adcres, beta, kelvin, rb, ginf;

				  adcres = 1023;
				  // Beta parameter
				  beta = 3950;
				  // 0°C = 273.15 K
				  kelvin = 273.15;
				  // 10 kOhm
				  rb = 10000;
				  // Ginf = 1/Rinf
				  ginf = 120.6685;

				  Thermistor = {
				    c: function(raw) {
				      var rthermistor, tempc;

				      rthermistor = rb * (adcres / raw - 1);
				      tempc = beta / (Math.log(rthermistor * ginf));

				      return tempc - kelvin;
				    },
				    f: function(raw) {
				      return (this.c(raw) * 9) / 5 + 32;
				    }
				  };
				}());
				
				board.on('ready', function(){
					sensor.on('read', function(err, value) {
					  tempButton.innerHTML = Thermistor.c(value);
					  // |value| is the raw sensor output
					  //console.log( "temperature is :", value );
					});
								
										
				  led.blink(1000);
				});
				
				
				
    },
/*
    Connects if not connected, and disconnects if connected:
*/
    manageConnection: function() {

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
            // if not connected, do this:
            // clear the screen and display an attempt to connect
            app.clear();
            app.display("Attempting to connect. " +
                "Make sure the serial port is open on the target device."+app.macAddress);
            // attempt to connect:
            bluetoothSerial.connect(
                app.macAddress,  // device to connect to
                app.openPort,    // start listening if you succeed
                app.showError    // show the error if you fail
            );
        };

        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
        var disconnect = function () {
            app.display("attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort,     // stop listening to the port
                app.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        bluetoothSerial.isConnected(disconnect, connect);
    },
/*
    subscribes to a Bluetooth serial listener for newline
    and changes the button:
*/
    openPort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Connected to: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe('\n', function (data) {
            app.clear();
            app.display(data);
        });
    },

/*
    unsubscribes from any Bluetooth serial listener and changes the button:
*/
    closePort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Disconnected from: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Connect";
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
                function (data) {
                    app.display(data);
                },
                app.showError
        );
    },
/*
    appends @error to the message div:
*/
    showError: function(error) {
        app.display(error);
    },

/*
    appends @message to the message div:
*/
    display: function(message) {
        var display = document.getElementById("message"), // the message div
            lineBreak = document.createElement("br"),     // a line break
            label = document.createTextNode(message);     // create the label

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },
/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    }
};      // end of app

console.log("device is ready, initialize the app");
app.initialize();
