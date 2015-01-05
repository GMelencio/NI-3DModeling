/// <reference path="Libs/Leap/leap-0.6.4.js" />
/// <reference path="Libs/Leap/leap-plugins-0.1.10.js" />
/// <reference path="Libs/Leap/leap-plugins-0.1.10-utils.js" />
/// <reference path="Libs/Leap/leap-widgets-0.1.0.js" />
/// <reference path="Libs/Leap/leap.rigged-hand-0.1.5.js" />

var ibox;
var riggedHandPlugin;
//Leap loop to call drawing functions
Leap.loop(
  function (frame) {
      ibox = frame.interactionBox;
      frame.hands.forEach(
        function (hand) {
            if (hand.type == "right") {
                var handGesture = new HandGesture(hand, ibox);
                TryDrawObject(handGesture);
            }
            else if (hand.type == "left") {
                var handMesh = hand.data('riggedHand.mesh');

            }
        }
   )
  }
)
.use('riggedHand')
.use('handEntry')

riggedHandPlugin = Leap.loopController.plugins.riggedHand;

//var prevTexture