import { KullaniciModel } from "./KullaniciModel.js";

// Input fileds
var talepEden = document.getElementById("talepEden");
var lokasyon = document.getElementById("lokasyon");
var email = document.getElementById("email");
var tel = document.getElementById("tel");
var konu = document.getElementById("konu");
var aciklama = document.getElementById("aciklama");
var birimBolum = document.getElementById("birim-bolum");
var birimBolumYetkilisi = document.getElementById("birim-bolum-yetkilisi");

document.getElementById("lokasyon").readOnly = true;
lokasyon.addEventListener("click", function (params) {
  toastr.options.positionClass = "toast-bottom-left";
  toastr.error("Lokasyon girme yetkiniz yok");
});

var date = new Date();
document.getElementById("date").innerHTML =
  date.getDate() + "." + date.getMonth() + "." + date.getFullYear();

function timeCount() {
  var today = new Date();

  var hour = today.getHours();
  if (hour < 10) hour = "0" + hour;

  var minute = today.getMinutes();
  if (minute < 10) minute = "0" + minute;

  var second = today.getSeconds();
  if (second < 10) second = "0" + second;

  document.getElementById("time").innerHTML =
    hour + ":" + minute + ":" + second;

  setTimeout(timeCount, 1000);
}

timeCount();

$("#talepEden").blur(function (e) {
  var user = kullaniciListe.find((item) => item.ISK_ISIM === $(this).val());
  if (user) {
    $("#email").val(user.ISK_MAIL);
    $("#tel").val(user.ISK_TELEFON_1);
    getLokasyon(user.ISK_LOKASYON_ID);
  } else {
    $("#email").val("");
    $("#tel").val("");
    $("#lokasyon").val("");
  }
});
//Fetch The Users Names Start

var usersName = [];
var kullaniciListe = [];

$.ajax({
  type: "get",
  url: "http://10.20.211.48:1456/api/talepKullanici",
  headers: {
    Authorization: "Basic T1JKSU46",
    "Accept-language": "en,tr,ru",
    "Content-Type": "application/json",
  },
  dataType: "json",
})
  .done(function (data) {
    var objectsData = data;
    for (let i = 0; i < objectsData.length; i++) {
      usersName.push(
        `${objectsData[i].ISK_ISIM} (Tel No: ${objectsData[i].ISK_TELEFON_1})`
      );
      kullaniciListe.push(
        new KullaniciModel(
          objectsData[i].TB_IS_TALEBI_KULLANICI_ID,
          objectsData[i].ISK_KOD,
          objectsData[i].ISK_ISIM,
          objectsData[i].ISK_LOKASYON_ID,
          objectsData[i].ISK_PERSONEL_ID,
          objectsData[i].ISK_MAIL,
          objectsData[i].ISK_TELEFON_1
        )
      );
    }
    $(".preloader").hide();
  })
  .fail(function () {
    $(".preloader").hide();
    toastr.options.positionClass = "toast-bottom-left";
    toastr.error("Bilgi transfer esnasında hata oluştu.");
  });

//Fetch The Users Names Finish -----------------------

$("#ekle").on("click", function () {
  event.preventDefault();
  checkFields();
  var talepEden = document.getElementById("talepEden").value;
  var email = document.getElementById("email").value;
  var tel = document.getElementById("tel").value;
  var konu = document.getElementById("konu").value;
  var aciklama = document.getElementById("aciklama").value;
  var birimBolum = document.getElementById("birim-bolum").value;
  var birimBolumYetkilisi = document.getElementById(
    "birim-bolum-yetkilisi"
  ).value;
  function checkInputs() {
    if (
      talepEden === "" ||
      lokasyon === "" ||
      email === "" ||
      !validatePhoneNumber(tel) ||
      konu === "" ||
      aciklama === "" ||
      birimBolum === "" ||
      birimBolumYetkilisi === ""
    )
      return true;
    return false;
  }
  if (checkInputs()) {
    if (talepEden === "") $("#talepEden").css("border-color", "red");
    if (konu === "") $("#konu").css("border-color", "red");
    if (aciklama === "") $("#aciklama").css("border-color", "red");
    if (!validatePhoneNumber(tel)) $("#tel").css("border-color", "red");
    if (email === "") $("#email").css("border-color", "red");
    if (birimBolum === "") $("#birim-bolum").css("border-color", "red");
    if (birimBolumYetkilisi === "")
      $("#birim-bolum-yetkilisi").css("border-color", "red");

    toastr.options.positionClass = "toast-bottom-left";
    toastr.error("Girilen bilgiler boş yada geçersiz olabilir.");
  } else {
    var user = kullaniciListe.find((item) => item.ISK_ISIM === talepEden);
    if (user) {
      postIsTalebi(
        aciklama,
        konu,
        user.ISK_TELEFON_1,
        user.ISK_MAIL,
        user.TB_IS_TALEBI_KULLANICI_ID,
        user.ISK_LOKASYON_ID,
        birimBolum,
        birimBolumYetkilisi
      );
    } else {
      $(".modal-form input").val("");
      document.querySelector(".modal").classList.remove("hidden");
      document.querySelector(".overlay").classList.remove("hidden");
      toastr.options.positionClass = "toast-bottom-left";
      toastr.error(talepEden + " isimli kullanıcı bulunamadı.");
    }
  }
});

//Fetch The Location Start

function getLokasyon(id) {
  var lokasyon = "";
  $.ajax({
    type: "get",
    url: "http://10.20.211.48:1456/api/getLokasyonById",
    data: { id: id },
    dataType: "json",
    headers: {
      Authorization: "Basic T1JKSU46",
      "Accept-language": "en,tr,ru",
      "Content-Type": "application/json",
    },
  })
    .done(function (response) {
      if (response != null && response != "") {
        lokasyon = response;
        $("#lokasyon").val(lokasyon);
      } else {
        toastr.options.positionClass = "toast-bottom-left";
        toastr.error("Kullanıcıya ait lokasyon bulunamadı.");
      }
    })
    .fail(function () {
      toastr.options.positionClass = "toast-bottom-left";
      toastr.error("Lokasyon transfer esnasında hata oluştu.");
    });
}

//Fetch The Location Finish -----------------------

function autocomplete(inp, arr) {
  var currentFocus;
  inp.addEventListener("input", function (e) {
    var a,
      b,
      i,
      val = this.value;
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(a);

    for (i = 0; i < arr.length; i++) {
      if (arr[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
        b = document.createElement("DIV");
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        b.addEventListener("click", function (e) {
          inp.value = this.getElementsByTagName("input")[0].value.replace(
            / \(Tel No.*$/,
            ""
          );
          var user = kullaniciListe.find(
            (item) => item.ISK_ISIM === inp.value.replace(/ \(Tel No.*$/, "")
          );
          $("#email").val(user.ISK_MAIL);
          $("#tel").val(user.ISK_TELEFON_1);
          getLokasyon(user.ISK_LOKASYON_ID);
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
    a.appendChild(createButton());
  });

  function createButton() {
    var buttonDiv = document.createElement("DIV");
    buttonDiv.innerHTML = `<button class="add-new-user">Yeni Kullanıcı Ekle</button>`;
    buttonDiv.addEventListener("click", function (e) {
      $(".modal-form input").val("");
      document.querySelector(".modal").classList.remove("hidden");
      document.querySelector(".overlay").classList.remove("hidden");
    });
    return buttonDiv;
  }

  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

autocomplete(document.getElementById("talepEden"), usersName);

//Is Talebi Ekle Function Start

function postIsTalebi(
  tanim,
  konu,
  telNo,
  mail,
  talepEdenId,
  lokasyonId,
  birimBolum,
  birimBolumYetkilisi
) {
  $(".preloader").show();
  $.ajax({
    type: "get",
    url: "http://10.20.211.48:1456/api/getIsTalebiKod",
    data: { nmrkod: "IST_KOD" },
    headers: {
      Authorization: "Basic T1JKSU46",
      "Accept-language": "en,tr,ru",
      "Content-Type": "application/json",
    },
    dataType: "json",
  })
    .done(function (response) {
      $("#isTalebiKod").val(response);

      var istKod = "ISTLP";
      var numberString = $("#isTalebiKod").val();
      var numberInt = parseInt($("#isTalebiKod").val());
      var digits = Math.floor(Math.log10(numberInt)) + 1; // find the number of digits
      if (digits == 1) {
        istKod += "0000" + numberString;
      } else if (digits == 2) {
        istKod += "000" + numberString;
      } else if (digits == 3) {
        istKod += "00" + numberString;
      } else if (digits == 4) {
        istKod += "0" + numberString;
      } else if (digits == 5) {
        istKod += numberString;
      }

      $.ajax({
        type: "GET",
        url: "http://10.20.211.48:1456/api/postIsTalebi",
        data: {
          istKodNumber: numberInt,
          istKod: istKod,
          tanimi: tanim,
          konu: konu,
          telNo: telNo,
          mail: mail,
          talepEdenId: talepEdenId,
          lokasyonId: lokasyonId,
          birimBolum: birimBolum,
          birimBolumYetkilisi: birimBolumYetkilisi,
        },
        headers: {
          Authorization: "Basic T1JKSU46",
          "Accept-language": "en,tr,ru",
          "Content-Type": "application/json",
        },
        dataType: "json",
      })
        .done(function (response) {
          toastr.options.positionClass = "toast-bottom-left";
          if (response === "true") {
            $(".preloader").hide();
            $("form input,form textarea").val("");
            toastr.success(
              istKod + " nolu kaydınız başarılı bir şekilde eklendi."
            );
          } else {
            $(".preloader").hide();
            toastr.error(response);
          }
        })
        .fail(function (response) {
          $(".preloader").hide();
          toastr.options.positionClass = "toast-bottom-left";
          toastr.error("Sunucu veya istemci hatası.");
        });
    })
    .fail(function (response) {
      $(".preloader").hide();
      toastr.options.positionClass = "toast-bottom-left";
      toastr.error("Kod transfer hatası.");
    });
}

//Is Talebi Ekle Function Finish -----------------------

function checkFields() {
  talepEden === ""
    ? $("#talepEden").css("border-color", "red")
    : $("#talepEden").css("border-color", "lightgray");
  email === ""
    ? $("#email").css("border-color", "red")
    : $("#email").css("border-color", "lightgray");
  tel === ""
    ? $("#tel").css("border-color", "red")
    : $("#tel").css("border-color", "lightgray");
  konu === ""
    ? $("#konu").css("border-color", "red")
    : $("#konu").css("border-color", "lightgray");
  aciklama === ""
    ? $("#aciklama").css("border-color", "red")
    : $("#aciklama").css("border-color", "lightgray");
  birimBolum === ""
    ? $("#birim-bolum").css("border-color", "red")
    : $("#birim-bolum").css("border-color", "lightgray");
  birimBolumYetkilisi === ""
    ? $("#birim-bolum-yetkilisi").css("border-color", "red")
    : $("#birim-bolum-yetkilisi").css("border-color", "lightgray");
}

function validatePhoneNumber(tel) {
  if (tel.trim() === "") {
    return false;
  }

  var numericPattern = /^\d+$/;
  return numericPattern.test(tel);
}
