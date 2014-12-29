/// <reference path="Libs/Leap/leap-0.6.4.js" />
/// <reference path="Libs/Leap/leap-plugins-0.1.10.js" />
/// <reference path="Libs/Leap/leap-plugins-0.1.10-utils.js" />
/// <reference path="Libs/Leap/leap-widgets-0.1.0.js" />
/// <reference path="Libs/Leap/leap.rigged-hand-0.1.5.js" />

var riggedHandPlugin;
//Leap loop to call drawing functions
Leap.loop(
  function (frame) {
      
      frame.hands.forEach(
        function (hand) {
            var handGesture = new HandGesture(hand);
            TryDrawObject(handGesture);
        }
   )
  }
)
.use('riggedHand')
.use('handEntry')

riggedHandPlugin = Leap.loopController.plugins.riggedHand;