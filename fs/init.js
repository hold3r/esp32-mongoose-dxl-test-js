load('api_config.js');
load('api_dash.js');
load('api_events.js');
load('api_gcp.js');
load('api_gpio.js');
load('api_shadow.js');
load('api_timer.js');
load('api_sys.js');

load('api_dxl.js');

let DXL_BAUD = 57600;
let LED_ID = 0x15;
let BTN_ID = 0x03;
let POT_ID = 0x13;

let led_pin = 2;//Cfg.get('board.led1.pin');      // Built-in LED GPIO number
let onhi = Cfg.get('board.led1.active_high');     // LED on when high?
let state = {on: false, btnCount: 0, uptime: 0};  // Device state
let online = false;                               // Connected to the cloud?
let led_state = false;
let pot_level = 1;
let active_led = "Red";
let button_last_state;


let led = Dxl.create(LED_ID);
let btn = Dxl.create(BTN_ID);
let pot = Dxl.create(POT_ID);

led.begin(DXL_BAUD);
led.init();
btn.init();
pot.init();

/* GPIO Led set function
*******************************************/
let setLED = function(on) {

  let level = onhi ? on : !on;
  let readdata = btn.read(27);

  if (readdata === 1) {
    GPIO.write(led_pin, level);
    print('LED on ->', on);
  } else {
    //print('Read: ', readdata);
    print('Pot: ', pot_level);
  }
};

GPIO.set_mode(led_pin, GPIO.MODE_OUTPUT);
setLED(state.on);

/* GPIO Led 
*******************************************/
Timer.set(333, Timer.REPEAT, function() {

    if (led_state === false) {
    	setLED(true);
    	led_state = true;
    }
    else {
    	setLED(false);	
    	led_state = false;
    }


}, null);

/* Pot check
*******************************************/
Timer.set(250, Timer.REPEAT, function() {

  pot_level = (((pot.read(27) << 8) + pot.read(26)) / 4);

}, null );


/* Brightness set 
*******************************************/
Timer.set(100, Timer.REPEAT, function() {

  if (active_led === "Red") {
    led.write(26, pot_level);
    led.write(27, 0);
    led.write(28, 0); 
  } else if (active_led === "Green") {
    led.write(26, 0);
    led.write(27, pot_level);
    led.write(28, 0); 
  } else {
    led.write(26, 0);
    led.write(27, 0);
    led.write(28, pot_level);
  }

}, null );


/* Button Led 
*******************************************/
Timer.set(440, Timer.REPEAT, function() {

  if (btn.read(27) === 1) {
    if (active_led === "Red") {
        active_led = "Green";
    } else if (active_led === "Green") {
        active_led = "Blue";
    } else {
      active_led = "Red";
    }
  }

}, null)


