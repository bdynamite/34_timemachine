// Here You can type your custom JavaScript...
var TIMEOUT_IN_SECS = 3 * 60
var SECOND_TIMEOUT_IN_SECS = 30
var TEMPLATE = '<h1><span class="js-timer-minutes">00</span>:<span class="js-timer-seconds">00</span></h1>'
var NOTIFICATIONS = [
  'Апатия и лень — истинное замерзание души и тела',
  'Праздность более утомляет, чем труд',
  'Нет злейшего страдания, как ничего не делать',
  'Лень — это мать. У нее сын — воровство и дочь — голод.',
  'Праздный человек есть животное, поедающее время.'
];

function padZero(number){
  return ("00" + String(number)).slice(-2);
}

class Timer{
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  constructor(timeout_in_secs){
    this.isRunning = false
    this.timestampOnStart = null
    this.initial_timeout_in_secs = timeout_in_secs
    this.timeout_in_secs = this.initial_timeout_in_secs
  }
  getTimestampInSecs(){
    var timestampInMilliseconds = new Date().getTime()
    return Math.round(timestampInMilliseconds/1000)
  }
  start(){
    if (this.isRunning)
      return
    this.timestampOnStart = this.getTimestampInSecs()
    this.isRunning = true
  }
  stop(){
    if (!this.isRunning)
      return
    this.timeout_in_secs = this.calculateSecsLeft()
    this.timestampOnStart = null
    this.isRunning = false
  }
  calculateSecsLeft(){
    if (!this.isRunning)
      return this.timeout_in_secs
    var currentTimestamp = this.getTimestampInSecs()
    var secsGone = currentTimestamp - this.timestampOnStart
    return Math.max(this.timeout_in_secs - secsGone, 0)
  }
}

class TimerWidget{
  // IE does not support new style classes yet
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  construct(){
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
  mount(rootTag){
    if (this.timerContainer)
      this.unmount()

    // adds HTML tag to current page
    this.timerContainer = document.createElement('div')

    this.timerContainer.setAttribute("style", "height: 70px; width: 100px; z-index: 1000; position: fixed; padding-left: 10px; background-color: yellow; opacity: 0.5; top: 70px; left: 30px")
    this.timerContainer.innerHTML = TEMPLATE

    rootTag.insertBefore(this.timerContainer, rootTag.firstChild)

    this.minutes_element = this.timerContainer.getElementsByClassName('js-timer-minutes')[0]
    this.seconds_element = this.timerContainer.getElementsByClassName('js-timer-seconds')[0]
  }
  update(secsLeft){
    var minutes = Math.floor(secsLeft / 60);
    var seconds = secsLeft - minutes * 60;

    this.minutes_element.innerHTML = padZero(minutes)
    this.seconds_element.innerHTML = padZero(seconds)
  }
  unmount(){
    if (!this.timerContainer)
      return
    this.timerContainer.remove()
    this.timerContainer = this.minutes_element = this.seconds_element = null
  }
}


function main(){

  var timer = new Timer(TIMEOUT_IN_SECS)
  var secondTimer = new Timer(SECOND_TIMEOUT_IN_SECS)
  var timerWiget = new TimerWidget()
  var intervalId = null
  var workingTimer = timer

  timerWiget.mount(document.body)

  function printAlert() {
      var random = Math.floor(Math.random() * NOTIFICATIONS.length)
      window.alert(NOTIFICATIONS[random])
  }

  function handleSecondTimer(){
    if (workingTimer.isRunning == false){
        workingTimer.start()
    }
    var secsLeft = workingTimer.calculateSecsLeft()
    if (secsLeft == '0') {
        printAlert()
        secondTimer = new Timer(SECOND_TIMEOUT_IN_SECS)
    }
  }

  function handleIntervalTick(){
    var secsLeft = timer.calculateSecsLeft()
    timerWiget.update(secsLeft)
    if (secsLeft == '0') {
        workingTimer = secondTimer
        handleSecondTimer()
    }
  }

  function handleVisibilityChange(){

    if (document.hidden) {
      workingTimer.stop()
      clearInterval(intervalId)
      intervalId = null
    } else {
      workingTimer.start()
      intervalId = intervalId || setInterval(handleIntervalTick, 300)
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  document.addEventListener("visibilitychange", handleVisibilityChange, false);
  handleVisibilityChange()
}

// initialize timer when page ready for presentation
window.addEventListener('load', main)
