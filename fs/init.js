load('api_config.js');
load('api_gpio.js');
load('api_timer.js');
load('api_sys.js');
load('api_uart.js');
load('api_dxl.js');


let DXL_BAUD = 57600;
let LED_ID = 0x15;
let BTN_ID = 0x03;
let POT_ID = 0x13;
let UARTn = 0;   

let led_pin = 2;  
let led_state = false;
let pot_level = 1;
let active_led = "Red";

DxlMaster.begin(DXL_BAUD);

let led = Dxl.create(LED_ID);
let btn = Dxl.create(BTN_ID);
let pot = Dxl.create(POT_ID);

led.init();
btn.init();
pot.init();

GPIO.set_mode(led_pin, GPIO.MODE_OUTPUT);

let uart_cb = function(len, data) {
  print('len:', len, 'Data:', data[len-1]);
};

DxlMaster.set_uart_callback(uart_cb, null);


/* Dxl init */
Timer.set(2000, 0, function() {
  Timer.set(1000, Timer.REPEAT, potentiometer, null);
  Timer.set(1000, Timer.REPEAT, button, null);
  Timer.set(1000, Timer.REPEAT, brightness, null);
}, null );


/* GPIO Led */
Timer.set(100, Timer.REPEAT, function() {
  if (led_state === false) {
    led_state = true;
    GPIO.write(led_pin, led_state);
  }
  else {
    led_state = false;
    GPIO.write(led_pin, led_state);	
  }

}, null);


function potentiometer() {
  let hi = pot.read(27);
  if (pot.status()) return 0; 
  let low = pot.read(26);
  if (pot.status()) return 0; 

  pot_level = (((hi << 8) + low) / 4);
  print('Pot:', pot_level);
}


function button() {
  if (btn.read(27) === 1) {
    if (active_led === "Red") {
        active_led = "Green";
    } else if (active_led === "Green") {
        active_led = "Blue";
    } else {
      active_led = "Red";
    }
  }
}


function brightness() {
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
}
