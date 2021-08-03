load('api_config.js');
load('api_dash.js');
load('api_events.js');
load('api_gcp.js');
load('api_gpio.js');
load('api_shadow.js');
load('api_timer.js');
load('api_sys.js');


let led = 2;//Cfg.get('board.led1.pin');              // Built-in LED GPIO number
let onhi = Cfg.get('board.led1.active_high');     // LED on when high?
let state = {on: false, btnCount: 0, uptime: 0};  // Device state
let online = false;                               // Connected to the cloud?
let led_state = false;

/*
struct mjs *mjs = mjs_create();
  mjs_set_ffi_resolver(mjs, my_dlsym);
  mjs_exec(mjs, "let f = ffi('void foo(int)'); f(1234)", NULL);
*/

let dxl_begin = ffi ('void mgos_dxl_module_begin(int)');

dxl_begin(57600);


let dxl_creat = ffi('void * mgos_dxl_module_create(int)');

let dxl_read = ffi('int mgos_dxl_module_read(void *, int, int )');

let dxl_write = ffi('int mgos_dxl_module_write(void *, int, int )');


let dxl_module = dxl_creat(0x15);

let setLED = function(on) {
  let level = onhi ? on : !on;
  GPIO.write(led, level);
  dxl_write(dxl_module, 26, level);
  print('LED on ->', on);
};

GPIO.set_mode(led, GPIO.MODE_OUTPUT);
setLED(state.on);

Timer.set(2000, Timer.REPEAT, function() {

    if (led_state === false) {
    	setLED(true);
    	led_state = true;
    }
    else {
    	setLED(false);	
    	led_state = false;
    }


}, null);
