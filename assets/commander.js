var keyring;
var config;
var privateKeyFormToggle = true;
var publicKeyFormToggle = true;
var generateKeyFormToggle = true;


function generateKeyPair(e){
  e.preventDefault();
  jQuery('.alert').hide();
  var form = jQuery('#generateKeyPairForm');
  var generateOptions = {
          numBits: parseInt(2048, 10),
          userId: form.find('#name').val() + ' <' + form.find('#email').val() + '>',
          passphrase: form.find('#password').val()
  };
  store.set("pass", form.find('#password').val());

  var keyPair = openpgp.generateKeyPair(generateOptions);
  keyPair.then(function(result) {
    console.log(result);
    keyring.privateKeys.importKey(result.privateKeyArmored);
    keyring.publicKeys.importKey(result.publicKeyArmored);
    keyring.store();
    // parsePrivateKeys();
    // parsePublicKeys();
    window.location = 'register.html';

  });
}

function insertPrivateKey(){
  jQuery('.alert').hide();
  var privKey = jQuery('#newPrivateKey').val();
  return handleKeyringImportResponse(keyring.privateKeys.importKey(privKey), '#insertPrivateKeyForm');
}

function insertPublicKey(){
  jQuery('.alert').hide();
  var pubKey = jQuery('#newPublicKey').val();
  return handleKeyringImportResponse(keyring.publicKeys.importKey(pubKey), '#insertPublicKeyForm');
}

function handleKeyringImportResponse(importResult, selector) {
  if (importResult === null) {
    keyring.store();
    parsePublicKeys();
    parsePrivateKeys();
    return true;
  }
  else {
    jQuery(selector).prepend('<div id="openpgpjs-error" class="alert alert-error"></div><div class="alert alert-error">Mymail-Crypt for Gmail was unable to read this key. It would be great if you could contact us so we can help figure out what went wrong.</div>');
    jQuery(selector + ' #openpgpjs-error').text(importResult);
    return false;
  }
}

function parsePublicKeys(){
  var keys = keyring.publicKeys.keys;
  var domPrefix = "public";

  parseKeys(keys, domPrefix);
}

function parsePrivateKeys() {
  var keys = keyring.privateKeys.keys;
  var domPrefix = "private";

  parseKeys(keys, domPrefix);
}

function parseKeys(keys, domPrefix){
    // var lastIndex = keys.length -1 ;
    var key = keys[0];
    if(key) {
      var user = gCryptUtil.parseUser(key.users[0].userId.userid);
      jQuery('#kname').text(user.userName);
      jQuery('#kemail').text(user.userEmail);
      jQuery('#kpkeys').html('<pre class="ui label">' + key.armor() + '</pre>');
    }
}

function xaddProfile() {


  var P = Profile.deployed();


  jQuery(this).addClass('loading');

  var W = Wallet.generate(store.get('pass'));
  var P = Profile.deployed();

  var thisWallet = W.toJSON();
  var newAddress = thisWallet.address;

  web3.eth.sendTransaction({
    from: web3.eth.coinbase,
    to: newAddress,
    value: web3.toWei(1, "ether")
  }, function(e, s){
    console.log("e: " + e);
    console.log("s: " + s);
  });


  setTimeout(function(){

    console.log('herer');

    var rawTx = {
      nonce: 0,
      gasPrice: 41000000000,
      gasLimit: 21000,
      to: P.address,
      value: 1,
      data: ''
    };
    var eTx = new ethUtil.Tx(rawTx);
    eTx.sign(buffer.Buffer(W.getPrivateKeyString(), 'hex'));
    var signedTx = '0x' + eTx.serialize().toString('hex');
    web3.eth.sendRawTransaction(signedTx, function(err, hash) {
    if (!err)
      console.log(hash);
    });
    //
    // P.add_my_info.sendTransaction('nik', "4ea76df82d139cc1b38440cc177ea539ba0e2214", [], [], [], {from: newAddress}).then(function(er, address) {
    //   console.log(er);
    //   console.log(address);
    // });

  }, 5000);


  // var balance = web3.eth.getBalance(wallet.address).toNumber();
  // console.log(web3.fromWei(balance, 'ether'));



}

function saveOptions(){
  saveOptionForCheckbox('stopAutomaticDrafts', 'stopAutomaticDrafts', true);
  saveOptionForCheckbox('includeMyself', 'includeMyself', true);
  saveOptionForCheckbox('showComment', 'show_comment', false);
  saveOptionForCheckbox('showVersion', 'show_version', false);
}

function saveOptionForCheckbox(elementId, configKey, thirdParty) {
  if(jQuery('#' + elementId + ':checked').length == 1){
    gCryptUtil.setOption(config, configKey, true, thirdParty);
  } else {
    gCryptUtil.setOption(config, configKey, false, thirdParty);
  }

}

function loadOptions(){
  if (gCryptUtil.getOption(config, 'stopAutomaticDrafts', true)) {
    jQuery('#stopAutomaticDrafts').attr('checked', true);
  }
  if (gCryptUtil.getOption(config, 'includeMyself', true)) {
    jQuery('#includeMyself').attr('checked', true);
  }
  if (gCryptUtil.getOption(config, 'show_comment', false)) {
    jQuery('#showComment').attr('checked', true);
  }
  if (gCryptUtil.getOption(config, 'show_version', false)) {
    jQuery('#showVersion').attr('checked', true);
  }
}

function linkLocalFunction(event){
  jQuery('.alert').hide();
  jQuery('span').hide();
  if(event && event.currentTarget){
    jQuery(event.currentTarget.hash).show();
  }
}

function onLoad(){
  keyring = new openpgp.Keyring();
  //TODO openpgp.js needs to improve config support, this is a hack.
  config = new openpgp.config.localStorage();
  try {
    config.read();
  }
  catch (e) {
    //no-op, makes more sense to handle this in finally since read can give null config
  }
  finally {
    if(_.isEmpty(config.config)) {
      config.config = openpgp.config;
      config.write();
    }
  }
  gCryptUtil.migrateOldKeys(keyring);
  parsePrivateKeys();
  parsePublicKeys();
  loadOptions();

  jQuery('.linkLocal').click(linkLocalFunction).click();
  // jQuery('#generateKeyPairForm').hide();
  jQuery('#generateKeyPairTitle').click(function() {
    jQuery('#generateKeyPairForm').toggle(generateKeyFormToggle);
    generateKeyFormToggle = !generateKeyFormToggle;
  });
  jQuery('#insertPrivateKeyForm').hide();
  jQuery('#insertPrivateKeyTitle').click(function() {
    jQuery('#insertPrivateKeyForm').toggle(privateKeyFormToggle);
    privateKeyFormToggle = !privateKeyFormToggle;
  });
  jQuery('#insertPublicKeyForm').hide();
  jQuery('#insertPublicKeyTitle').click(function() {
    jQuery('#insertPublicKeyForm').toggle(publicKeyFormToggle);
    publicKeyFormToggle = !publicKeyFormToggle;
  });
  jQuery('#optionsFormSubmit').click(saveOptions);
  jQuery('#insertPrivateKeyFormSubmit').click(insertPrivateKey);
  jQuery('#generateKeyPairFormSubmit').click(generateKeyPair);
  jQuery('#insertPublicKeyFormSubmit').click(insertPublicKey);



}

jQuery(document).ready(onLoad());
