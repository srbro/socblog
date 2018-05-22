import forge from 'node-forge'

/* eslint-disable */
var chars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
             "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
             "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

function getRandomString(len) {
  var ret = "",
      i;

  for (i = 0; i < len; i += 1) {
    ret += chars[Math.floor(Math.random() * chars.length)];
  }

  return ret;
}

function chars_from_hex(inputstr) {
  var outputstr = "",
      i,
      final_inputstr = inputstr.replace(/^(0x)?/g, "");

  final_inputstr = final_inputstr.replace(/[^A-Fa-f0-9]/g, "");
  final_inputstr = final_inputstr.split("");

  for (i = 0; i < inputstr.length; i += 2) {
    outputstr += String.fromCharCode(parseInt(String(final_inputstr[i]) + String(final_inputstr[i + 1]), 16));
  }

  return outputstr;
}

function hex_from_chars(inputstr) {
  var delimiter = "",
      outputstr = "",
      hex = "0123456789abcdef",
      i,
      n,
      inputarr = inputstr.split("");

  hex = hex.split("");

  for (i = 0; i < inputarr.length; i += 1) {
    if (i > 0) {
      outputstr += delimiter;
    }
    if (!delimiter && i % 32 === 0 && i > 0) {
      outputstr += "\n";
    }
    n = inputstr.charCodeAt(i);
    outputstr += hex[(n >> 4) & 0xf] + hex[n & 0xf];
  }

  return outputstr;
}

function ensure(input_str, numBytes) {
    // Handle null or empty string cases as well
  var ret = "",
      i,
      c,
      str = " ";

  if (!input_str || input_str === "") {
    str = " ";
  }
  else {
    str = input_str;
  }

    // Expand string capacity
  while (str.length < numBytes * 2) {
    str += str;
  }
  for (i = 0; i < numBytes; i++) {
    c = str.charCodeAt(i) & 0x0f;
    c <<= 4;
    c |= str.charCodeAt(i + 1) & 0x0f;
    ret += String.fromCharCode(c);
  }

  return hex_from_chars(ret);
}

function doEncrypt(vector, key, input) {
  var char_key    = chars_from_hex(key),
      char_vector = chars_from_hex(vector),
      output      = des(char_key, input, 1, 1, char_vector);

  return hex_from_chars(output);
}

function encrypt(input_iv, input_key, plainText) {
  // Ensure 8-byte IV
  // Ensure 24-byte key
  var iv = ensure(input_iv, 8),
      key = ensure(input_key, 24);

  if (!plainText) {
    return plainText;
  }

  if (plainText === "") {
    return "";
  }

  return doEncrypt(iv, key, plainText);
}

function chars_from_hexchars(input_hexchars) {
  var out_chars = "",
      i,
      hexchars = input_hexchars;

  if (hexchars.length % 2) {
    hexchars = "0" + hexchars;
  }
  for (i = 0; i < hexchars.length; i += 2) {
    out_chars += String.fromCharCode(parseInt("0x" + hexchars.substr(i, 2), 16));
  }

  return out_chars;
}


//AES part

function fromBase64ForUrl(input_base64) {
  var base64 = input_base64.split("-").join("+").split("_").join("/");

  if (base64.length % 4 === 2) {
    base64 += "==";
  }
  else if (base64.length % 4 === 3) {
    base64 += "=";
  }

  return base64;
}

function toBase64ForUrl(input_base64) {
  return input_base64.split("+").join("-").split("/").join("_").split("=").join("");
}

export const encryptAES = function(iv, key, plainText) {
  // Convert IV from base64 to byte array
  var char_iv = atob(fromBase64ForUrl(iv)),
      char_key = atob(fromBase64ForUrl(key)),
      cipher = forge.cipher.createCipher("AES-CBC", char_key);

  // Convert key from base64 to byte array
  cipher.start({iv : char_iv});

  cipher.update(forge.util.createBuffer(plainText));

  cipher.finish();

  // Return base64 encoded data
  return toBase64ForUrl(btoa(cipher.output.data));
}

function decryptAES(iv, key, encryptedText) {
    // Convert IV from base64 to byte array
    // Convert key from base64 to byte array
  var char_iv = atob(fromBase64ForUrl(iv)),
      char_key = atob(fromBase64ForUrl(key)),
      cipher = forge.cipher.createDecipher("AES-CBC", char_key);

  cipher.start({iv : char_iv});
  cipher.update(forge.util.createBuffer(atob(fromBase64ForUrl(encryptedText))));
  cipher.finish();

    // Return base64-encoded data
  return toBase64ForUrl(btoa(cipher.output.data));
}

export const getRandomBytesBase64 = function(numBytes) {
  var arr = new Uint8Array(numBytes),
      i,
      binary = "";

  for (i = 0; i < arr.length; i++) {
    arr[i] = Math.floor(Math.random() * 255);
  }

  for (i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }

  return toBase64ForUrl(btoa(binary));
}
