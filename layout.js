// LED indices from ajazz-linux/ajazzctl/layout.py (kb-k600t.xml).
// Esc, WASD, Enter and Space confirmed on this keyboard.
const rows = [
  [['Esc',41,15],['F1',58,14],['F2',59,13],['F3',60,12],['F4',61,11],['F5',62,10],['F6',63,9],['F7',64,8],['F8',65,7],['F9',66,6],['F10',67,5],['F11',68,4],['F12',69,3],['Del',76,43]],
  [['`',53,16],['1',30,17],['2',31,18],['3',32,19],['4',33,20],['5',34,21],['6',35,22],['7',36,23],['8',37,24],['9',38,25],['0',39,26],['-',45,27],['=',46,28],['Backspace',42,29,2],['Home',74,31]],
  [['Tab',43,57,1.5],['Q',20,56],['W',26,55],['E',8,54],['R',21,53],['T',23,52],['Y',28,51],['U',24,50],['I',12,49],['O',18,48],['P',19,47],['[',47,46],[']',48,45],['\\',49,44,1.5],['PgUp',75,32]],
  [['CapsLock',57,58,1.75],['A',4,59],['S',22,60],['D',7,61],['F',9,62],['G',10,63],['H',11,64],['J',13,65],['K',14,66],['L',15,67],[';',51,68],["'",52,69],['Enter',40,70,2.25],['PgDn',78,41]],
  [['LShift',225,90,2.25],['Z',29,89],['X',27,88],['C',6,87],['V',25,86],['B',5,85],['N',17,84],['M',16,83],[',',54,82],['.',55,81],['/',56,80],['RShift',229,79,1.75],['↑',82,78],['End',77,42]],
  [['LCtrl',224,91,1.25],['LWin',227,92,1.25],['LAlt',226,93,1.25],['Space',44,94,6.25],['RAlt',230,95],['Fn',175,97],['RCtrl',228,98],['←',80,99],['↓',81,100],['→',79,101]]
];
export const KEYBOARD_KEYS = rows.flatMap((row, r) => {
  let x = 20;
  return row.map(([label, code, led, units = 1]) => {
    const key = { id: led, label, code, led, x, y: 20 + r * 39, w: units * 35 - 2, h: 34 };
    x += units * 35;
    return key;
  });
});
export const KNOB_CONTROL = { id: 'knob', label: 'Volume knob / mute (no RGB assignment)', x: 555, y: 20, w: 34, h: 34 };
const codes = {
  Escape:41, Backquote:53, Minus:45, Equal:46, Backspace:42, Tab:43, CapsLock:57,
  BracketLeft:47, BracketRight:48, Backslash:49, Semicolon:51, Quote:52, Enter:40,
  ShiftLeft:225, ShiftRight:229, ControlLeft:224, ControlRight:228, MetaLeft:227,
  AltLeft:226, AltRight:230, Space:44, Delete:76, Home:74, PageUp:75, PageDown:78,
  End:77, ArrowUp:82, ArrowDown:81, ArrowLeft:80, ArrowRight:79
};
for (let i = 0; i < 26; i++) codes['Key' + String.fromCharCode(65 + i)] = 4 + i;
for (let i = 1; i <= 12; i++) codes['F' + i] = 57 + i;
for (let i = 1; i <= 9; i++) codes['Digit' + i] = 29 + i;
codes.Digit0 = 39;
codes.Comma = 54; codes.Period = 55; codes.Slash = 56;
export const CODE_TO_KEY_ID = Object.fromEntries(Object.entries(codes).map(([eventCode, usage]) => [eventCode, KEYBOARD_KEYS.find(k => k.code === usage)?.id]));
