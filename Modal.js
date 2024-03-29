const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const closeModalBtn = document.querySelector(".btn-close");
var lokasyonlar = [];

const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
  $(".form-modal input").val("");
};

closeModalBtn.addEventListener("click", closeModal);

overlay.addEventListener("click", closeModal);

function autocomplete(inp, arr) {
  console.log(arr);
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

    a.style.top = "57% !important";
    a.style.border = "unset !important";

    this.parentNode.appendChild(a);
    for (i = 0; i < arr.length; i++) {
      if (arr[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
        b = document.createElement("DIV");
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        b.addEventListener("click", function (e) {
          inp.value = this.getElementsByTagName("input")[0].value;
          var user = kullaniciListe.find((item) => item.ISK_ISIM === inp.value);
          $("#email").val(user.ISK_MAIL);
          $("#tel").val(user.ISK_TELEFON_1);
          getLokasyon(user.ISK_LOKASYON_ID);
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });

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

function getLokasyonlar() {
  $.ajax({
    type: "GET",
    url: "http://10.20.211.48:1456/api/getLokasyonlar",
    headers: {
      Authorization: "Basic T1JKSU46",
      "Accept-language": "en,tr,ru",
      "Content-Type": "application/json",
    },
    dataType: "json",
  })
    .done(function (response) {
      if (response != null && response != "") {
        var objects = response;
        for (var i = 0; i < objects.length; i++) {
          if (objects[i].endsWith("\r\n")) {
            lokasyonlar.push(objects[i].replace(/\r\n/g, ""));
          } else {
            lokasyonlar.push(objects[i]);
          }
        }
      } else {
        toastr.options.positionClass = "toast-bottom-left";
        toastr.error("Herhangi bir lokasyon bilgisi yok.");
      }
    })
    .fail(function (response) {
      toastr.options.positionClass = "toast-bottom-left";
      toastr.error("Lokasyon transfer esnasında hata oluştu.");
    });
}
getLokasyonlar();
autocomplete(document.getElementById("kullaniciLokasyon"), lokasyonlar);

//Add Kullanici

$("#kullaniciEkle").on("click", function (event) {
  let isReadyToPost = true;
  let kullaniciAdi = $("#kullaniciAdi").val();
  let kullaniciTel = $("#kullaniciTel").val();
  let kullaniciLokasyon = $("#kullaniciLokasyon").val();
  let kullaniciMail = $("#kullaniciMail").val();

  if (kullaniciAdi == null || kullaniciAdi.trim() === "") {
    isReadyToPost = false;
    $("#kullaniciAdi").css("border-color", "red");
  } else {
    $("#kullaniciAdi").css("border-color", "");
  }

  if (kullaniciLokasyon == null || kullaniciLokasyon.trim() === "") {
    isReadyToPost = false;
    $("#kullaniciLokasyon").css("border-color", "red");
  } else {
    $("#kullaniciLokasyon").css("border-color", "");
  }

  if (!validatePhoneNumber(kullaniciTel)) {
    isReadyToPost = false;
    $("#kullaniciTel").css("border-color", "red");
  } else {
    $("#kullaniciTel").css("border-color", "");
  }

  if (isReadyToPost) {
    addNewUser(kullaniciAdi, kullaniciTel, kullaniciLokasyon, kullaniciMail);
  } else {
    toastr.options.positionClass = "toast-bottom-left";
    toastr.error("Girilen bilgiler boş yada geçersiz olabilir.");
  }
});

function addNewUser(
  kullaniciAdi,
  kullaniciTel,
  kullaniciLokasyon,
  kullaniciMail
) {
  if (!lokasyonlar.includes(kullaniciLokasyon)) {
    toastr.options.positionClass = "toast-bottom-left";
    toastr.error("Girilen lokasyon geçersiz.");
  } else {
    var data = {
      userModel: {
        kullaniciIsmi: kullaniciAdi,
        kullaniciTelefon: kullaniciTel,
        kullaniciLok: kullaniciLokasyon,
        kullaniciEmail: kullaniciMail,
      },
    };

    $.ajax({
      type: "post",
      url: `http://10.20.211.48:1456/api/YeniKullaniciEkle`,
      data: JSON.stringify(data),
      headers: {
        Authorization: "Basic T1JKSU46",
        "Accept-language": "en,tr,ru",
      },
      contentType: "application/json",
    })
      .done(function (response) {
        if (response.Durum) {
          alert(response.Aciklama);
          location.reload();
        } else {
          toastr.options.positionClass = "toast-bottom-left";
          toastr.error("Ekleme başarısız.");
        }
      })
      .fail(function (response) {
        toastr.options.positionClass = "toast-bottom-left";
        toastr.error("Bağlantı hatası.");
      });
  }
}

function validatePhoneNumber(kullaniciTel) {
  if (kullaniciTel.trim() === "") {
    return false;
  }

  var numericPattern = /^\d+$/;
  return numericPattern.test(kullaniciTel);
}
