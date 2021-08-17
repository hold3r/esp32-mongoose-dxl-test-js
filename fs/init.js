load('api_config.js');
load('api_gpio.js');
load('api_timer.js');
load('api_sys.js');
load('api_uart.js');

load('api_dxl.js');


let uartNo = 0;   
let DXL_BAUD = 57600;
let LED_ID = 0x15;
let BTN_ID = 0x03;
let POT_ID = 0x13;

let led_pin = 2;  
let led_state = false;
let pot_level = 1;
let active_led = "Red";
let button_last_state;

let DXL_enabled = true;

let led = Dxl.create(LED_ID);
let btn = Dxl.create(BTN_ID);
let pot = Dxl.create(POT_ID);

/* Set GPIO mode */
GPIO.set_mode(led_pin, GPIO.MODE_OUTPUT);


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
  if (DXL_enabled === false) return;
  let hi = pot.read(27);
  if (pot.status()) return 0; 
  let low = pot.read(26);
  if (pot.status()) return 0; 

  pot_level = (((hi << 8) + low) / 4);
  print('Pot:', pot_level);
}


/* Button Led */
function button() {
  if (DXL_enabled === false) return;
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


/* Brightness set */
function brightness() {
  if (DXL_enabled === false) return;
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


Timer.set(1, Timer.REPEAT, potentiometer, null);
Timer.set(1, Timer.REPEAT, button, null); 
Timer.set(1, Timer.REPEAT, brightness, null);

/* Dxl init */
 Timer.set(5000, 0, function() {
   led.begin(DXL_BAUD);
   led.init();
   btn.init();
   pot.init();

 }, null );

let rpc_check = function (rx_data) {
  let pattern = ['\"', '\"', '\"', '\x04', '\"', '\"', '\"', '\x0A', '\x0A']; 

  if(rx_data.length === 9) {
    for (let i = 0; i < 9; i++) {
      if(rx_data[i] !== pattern[i]) return;
    }
    print('UART is disabled');
    
    DXL_enabled = false;
    print('DXL status:', DXL_enabled);

    print('RPC_UART_Init:', ff_rpc_uart_init());
    //Sys.reboot(1);
  }

};


UART.setDispatcher(uartNo, function(uartNo) {
  if (UART.isRxEnabled(0) === false) {
    print('UART is disabled');
    
    return;
    }
  let ra = UART.readAvail(uartNo);
  if (ra > 0) {
    let data = UART.read(uartNo);
    rpc_check(data); 
    print(data);
 
  }
}, null);


// Enable Rx
UART.setRxEnabled(uartNo, true);

