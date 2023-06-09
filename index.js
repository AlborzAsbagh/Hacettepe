
import { KullaniciModel } from "./KullaniciModel.js";

// Input fileds
var talepEden = document.getElementById('talepEden');
var lokasyon = document.getElementById('lokasyon');
var email = document.getElementById('email');
var tel = document.getElementById('tel');
var konu = document.getElementById('konu');
var aciklama = document.getElementById('aciklama');

document.getElementById('lokasyon').readOnly = true;
lokasyon.addEventListener('click',function (params) {
    toastr.options.positionClass = 'toast-bottom-left';
    toastr.error('Bölge girme yetkiniz yok');
});

var date = new Date();
document.getElementById('date').innerHTML = date.getDate() + "." + date.getMonth() + "." + date.getFullYear();


function timeCount() {
    var today = new Date();

    var hour = today.getHours();
    if(hour<10)hour = "0"+hour;

    var minute = today.getMinutes();
    if(minute<10)minute = "0"+minute;

    var second = today.getSeconds();
    if(second<10)second = "0"+second;

    document.getElementById("time").innerHTML = hour+":"+minute+":"+second;

    setTimeout(timeCount, 1000);
}

timeCount();

$('#talepEden').blur(function (e) { 
    var user = kullaniciListe.find(item=>item.ISK_ISIM === $(this).val());
    if(user) {
        $('#email').val(user.ISK_MAIL);
        $('#tel').val(user.ISK_TELEFON_1);
        getLokasyon(user.ISK_LOKASYON_ID);
    }else {
        $('#email').val("");
        $('#tel').val("");
        $("#lokasyon").val("");
    }
});


//Fetch The Users Names Start


var usersName = [];
var kullaniciListe = [];

$.ajax({
    type: "get",
    url: "http://192.168.1.44:45483/api/talepKullanici",
    headers: {
        "Authorization" : "Basic T1JKSU46",
        "Accept-language":"en,tr,ru",
        "Content-Type": "application/json"
    } , 
    dataType: "json",
    success: function (data) {
        var objectsData = data;
        for(let i = 0 ; i < objectsData.length ; i++) {
            usersName.push(objectsData[i].ISK_ISIM);
            kullaniciListe.push(new KullaniciModel(
                objectsData[i].TB_IS_TALEBI_KULLANICI_ID , 
                objectsData[i].ISK_KOD,
                objectsData[i].ISK_ISIM,
                objectsData[i].ISK_LOKASYON_ID,
                objectsData[i].ISK_PERSONEL_ID,
                objectsData[i].ISK_MAIL,
                objectsData[i].ISK_TELEFON_1
            ));
        }
        $('.preloader').hide();
    },
    error:function () {
        $('.preloader').hide();
        toastr.options.positionClass = 'toast-bottom-left';
        toastr.error("Bilgi transfer esnasında hata oluştu.");
    }
});

//Fetch The Users Names Finish -----------------------


$('#ekle').on('click', function () {
    event.preventDefault();
    checkFields();
    var talepEden = document.getElementById('talepEden').value;
    var email = document.getElementById('email').value;
    var tel = document.getElementById('tel').value;
    var konu = document.getElementById('konu').value;
    var aciklama = document.getElementById('aciklama').value;
    function checkInputs() {
        if(talepEden === "" || lokasyon === "" || email === "" || tel === "" || konu === "" || aciklama === "") return true;
        return false;
    }
    if(checkInputs()) {
        if(talepEden === "") $('#talepEden').css('border-color', 'red');
        if(konu === "")  $('#konu').css('border-color', 'red');
        if(aciklama === "")  $('#aciklama').css('border-color', 'red');
        if(tel === "")  $('#tel').css('border-color', 'red');
        if(email === "")  $('#email').css('border-color', 'red');

        toastr.options.positionClass = 'toast-bottom-left';
        toastr.error("Lütfen zorunlu alanları doldurunuz.");
    } else {
        var user = kullaniciListe.find(item=>item.ISK_ISIM === talepEden);
        if(user) {
            postIsTalebi(aciklama,konu,user.ISK_TELEFON_1,user.ISK_MAIL,user.TB_IS_TALEBI_KULLANICI_ID,user.ISK_LOKASYON_ID);
        } else {
            toastr.options.positionClass = 'toast-bottom-left';
            toastr.error(talepEden+" isimli kullanıcı bulunamadı.");
        }
    }
});

//Fetch The Location Start

function getLokasyon(id) {

    var lokasyon = ""

    $.ajax({
        type: "get",
        url: "http://192.168.1.44:45483/api/getLokasyonById",
        data: {id:id},
        dataType: "json",
        headers: {
            "Authorization" : "Basic T1JKSU46",
            "Accept-language":"en,tr,ru",
            "Content-Type": "application/json"
        },
        success: function (response) {
            if(response != null && response != ""){
                lokasyon = response;
                $('#lokasyon').val(lokasyon);
            } else {
                toastr.options.positionClass = 'toast-bottom-left';
                toastr.error("Kullanıcıya ait bölge bulunamadı.");
            }
        },
        error: function () {
            toastr.options.positionClass = 'toast-bottom-left';
            toastr.error("Bölge transfer esnasında hata oluştu.");
        }
    });
}

//Fetch The Location Finish -----------------------

function autocomplete(inp, arr) {
    
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
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
                b.addEventListener("click", function(e) {
                    inp.value = this.getElementsByTagName("input")[0].value;
                    var user = kullaniciListe.find(item=>item.ISK_ISIM === inp.value);
                    $('#email').val(user.ISK_MAIL);
                    $('#tel').val(user.ISK_TELEFON_1); 
                    getLokasyon(user.ISK_LOKASYON_ID);
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    inp.addEventListener("keydown", function(e) {
        $('#email').val("");
        $('#tel').val("");
        $('#lokasyon').val("");
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode === 40) {
            addActive(x);
        } else if (e.keyCode === 38) {
            currentFocus--;
            addActive(x);
        } else if (e.keyCode === 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
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

autocomplete(document.getElementById('talepEden'), usersName);

//Is Talebi Ekle Function Start

function postIsTalebi(tanim,konu,telNo,mail,talepEdenId,lokasyonId) {

    $('.preloader').show();
    $.ajax({
        type: "get",
        url: "http://192.168.1.44:45483/api/getIsTalebiKod",
        data: {nmrkod: 'IST_KOD'},
        headers: {
          "Authorization": "Basic T1JKSU46",
          "Accept-language": "en,tr,ru",
          "Content-Type": "application/json"
        },
        dataType: "json",
        success: function (response) {
          $('#isTalebiKod').val(response);
      
          var istKod = 'ISTLP';
          var numberString = $('#isTalebiKod').val();
          var numberInt = parseInt($('#isTalebiKod').val());
          var digits = Math.floor(Math.log10(numberInt)) + 1; // find the number of digits
          if (digits == 1) {
            istKod += "0000" + numberString
          } else if (digits == 2) {
            istKod += "000" + numberString
          } else if (digits == 3) {
            istKod += "00" + numberString
          } else if (digits == 4) {
            istKod += "0" + numberString
          } else if (digits == 5) {
            istKod += numberString
          }
      
          $.ajax({
            type: "get",
            url: "http://192.168.1.44:45483/api/postIsTalebi",
            data: {
              istKodNumber: numberInt,
              istKod: istKod,
              tanimi: tanim,
              konu: konu,
              telNo: telNo,
              mail: mail,
              talepEdenId: talepEdenId,
              lokasyonId: lokasyonId
            },
            headers: {
              "Authorization": "Basic T1JKSU46",
              "Accept-language": "en,tr,ru",
              "Content-Type": "application/json"
            },
            dataType: "json",
            success: function (response) {
              toastr.options.positionClass = 'toast-bottom-left';
              if (response === "true") {
                $('.preloader').hide();
                toastr.success(istKod + ' nolu kaydınız başarılı bir şekilde eklendi.');
              } else {
                $('.preloader').hide();
                toastr.error(response);
              }
            },
            error: function (response) {
              $('.preloader').hide();
              toastr.options.positionClass = 'toast-bottom-left';
              toastr.error("Sunucu veya istemci hatası.");
            }
          });
        },
        error: function (response) {
          $('.preloader').hide();
          toastr.options.positionClass = 'toast-bottom-left';
          toastr.error("Kod transfer hatası.");
        }
      });
      
}

//Is Talebi Ekle Function Finish -----------------------


function checkFields() {
    talepEden === "" ? $('#talepEden').css('border-color', 'red') : $('#talepEden').css('border-color', 'lightgray');
    email === "" ? $('#email').css('border-color', 'red') : $('#email').css('border-color', 'lightgray');
    tel === "" ? $('#tel').css('border-color', 'red') : $('#tel').css('border-color', 'lightgray');
    konu === "" ? $('#konu').css('border-color', 'red') : $('#konu').css('border-color', 'lightgray');
    aciklama === "" ? $('#aciklama').css('border-color', 'red') : $('#aciklama').css('border-color', 'lightgray');
}
