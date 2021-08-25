load('api_config.js');
load('api_gpio.js');
load('api_timer.js');
load('api_sys.js');
load('api_uart.js');
/*
let led_pin = 2;  
let led_state = false;


GPIO.set_mode(led_pin, GPIO.MODE_OUTPUT);

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


print('Hello from JS!!');

let cbSet = ffi('void setCb(void(*)(int, userdata), userdata)');

let cb = function (x) {
  print('JS_cb', x);
};

cbSet(cb, null);
*/

let cb = function (pParam) {

  print('–mjs: Callback has been called with ', pParam, 'and is returning ');

};

let cbParam = 'Hello World!';
let cbSet = ffi('void setCb(void(*) (void *, userdata), void *, userdata)');
  
cbSet(cb, cbParam, null);