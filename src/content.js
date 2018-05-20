import { Observable } from "rx-lite";

const CtrlA = [17, 65];
const ShiftFive = [16, 53];
const ShiftQuote = [16, 222];
const X = [88];
const Up = [38];
const Right = [39];
const Down = [40];
const Left = [37];

const msg = i => browser.runtime.sendMessage(null, i, null);

const onTwoKeysDown = (a, b) => {
  let a_down = false;

  return new Observable.create(ob => {
    document.addEventListener("keydown", event => {
      if (event.ctrlKey && event.keyCode == 65) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (event.keyCode === a) {
        a_down = true;
      }

      if (event.keyCode === b && a_down) {
        a_down = false;
        ob.next();
      }
    });

    document.addEventListener("keyup", ({ keyCode }) => {
      if (keyCode === a) a_down = false;
    });
  });
};

const onSingleKeyDown = a => {
  return Observable.create(ob => {
    document.addEventListener("keydown", ({ keyCode }) => {
      if (keyCode === a) ob.next();
    });
  });
};

onTwoKeysDown(...CtrlA).subscribe(() => {
  onTwoKeysDown(...ShiftFive)
    .take(1)
    .subscribe(() => msg("SPLIT_HORIZONTAL"));

  onTwoKeysDown(...ShiftQuote)
    .take(1)
    .subscribe(() => msg("SPLIT_VERTICAL"));

  onSingleKeyDown(...Up)
    .take(1)
    .subscribe(() => msg("MOVE_UP"));

  onSingleKeyDown(...Right)
    .take(1)
    .subscribe(() => msg("MOVE_RIGHT"));

  onSingleKeyDown(...Down)
    .take(1)
    .subscribe(() => msg("MOVE_DOWN"));

  onSingleKeyDown(...Left)
    .take(1)
    .subscribe(() => msg("MOVE_LEFT"));

  onSingleKeyDown(...X)
    .take(1)
    .subscribe(() => msg("CLOSE_PANE"));
});
