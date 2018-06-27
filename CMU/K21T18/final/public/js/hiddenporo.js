"use strict";
const socket = io("http://localhost:8080");
socket.on("online", a=>{
    $("#Id_online").html(a)
}
);
socket.on('notfound', data => {
  $datalist.html("");
  $datalist.append(dataList(data,false));
});
socket.on('elastic', data => {
  if(data.length === 0) {
    $datalist.html("");
    $datalist.append(dataList('Không tìm thấy sản phẩm',false));
  } else {
    $datalist.html("");
    for(let _arr of data) {
      $datalist.append(dataList(_arr,true));
    }
  }
});
function dataList(data, yn) {
  if(yn) {
    usa = `<a href="${$uri}/san-pham/chi-tiet-san-pham/${data._id}" class="list-group-item" onclick="itemElastic(this)">${data.Product_Name}&nbsp;<span class="badge">${data.Price}&nbsp;₫</span></a>`;
    return usa;
  } else {
    nga = `<li class="list-group-item list-group-item-success disabled"><span><i class="glyphicon glyphicon-search"></i></span>&nbsp;${data}</li>`;
    return nga;
  }
}

let $header = $("div#header_all")
  , usa, nga, $elast_Arr = new Array(), $elast_Obj = new Object()
  , $header_top = $("div.top")
  , $note = $("div.hello")
  , $caht = $("div.caht")
  , $datalist = $("div#data-list")
  , $wait = $("div#wait")
  , $loi = $("div#loi")
  , $localStorage = JSON.parse(localStorage.getItem("elasticPersist:searchHistoryGlobal"))
  , $uri = $("a#logo_footer_page").attr('href')
  , $elasticsearch = $("input#elasticsearch")
  , $mes_err = $("p#p_loi")
  , $body = $("body")
  , reload_page = ()=>{
    let e = `<div title="Đang xử lý ..." style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; perspective: 1000px; background-color: #00000085; z-index: 9998;"><div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; transform: scale(.3); background: url(../../../../../images/load.gif) center center / contain no-repeat;"></div></div>`;
    $("body").append(e),
    location.reload(!1)
    },
    loi_page = (error, ynq) => {
      let l = `<div class="modal-backdrop fade in backdrop"></div>`;
      if(ynq) {
        $mes_err.text(error.status + '\n' + error.statusText);
        $loi.addClass('in').css({'display': 'block', 'padding-right': '16px'});
        $body.addClass('modal-open').css('padding-right','16px').append(l);
      } else {
        $loi.removeClass('in').css({'display': 'none', 'padding-right': 'unset'});
        $body.removeClass('modal-open').css('padding-right','unset');
        $body.children('div.backdrop').remove();
      }
    }
    ;
  function itemElastic(e) {
    let idel = e.getAttribute("href"),
        regexPro = e.firstElementChild.textContent,
        id_elastic = idel.slice(idel.lastIndexOf("/")).replace(/\//g, "").trim();
    if (typeof(Storage) !== "undefined") {
      if(($localStorage !== null) && ($localStorage !== "undefined")) {
        $elast_Arr.push(...$localStorage);
        localStorage_elast(e,idel,regexPro,id_elastic,true);
      } else {
        localStorage_elast(e,idel,regexPro,id_elastic,false);
      }
    } else {
      alert('Trình duyệt của bạn đã cũ. Vui lòng nâng cấp trình duyệt để sử dụng tính năng này');
    }
  };
  function localStorage_elast(e,idel,regexPro,id_elastic,valiStorage) {
    $elast_Obj._id = id_elastic;
    $elast_Obj.Price = regexPro.replace(/₫/g, "").trim();
    $elast_Obj.Product_Name = e.textContent.replace(regexPro, "").trim();
    if(valiStorage) {
      let valueArr = $localStorage.map(function(item){ return item._id });
      let isDuplicate = valueArr.indexOf(id_elastic);
      if(isDuplicate === -1) {
        $elast_Arr.unshift($elast_Obj);
        localStorage.setItem("elasticPersist:searchHistoryGlobal", JSON.stringify($elast_Arr));
      }
    } else {
      $elast_Arr.unshift($elast_Obj);
      localStorage.setItem("elasticPersist:searchHistoryGlobal", JSON.stringify($elast_Arr));
    }
  }
$(document).ready(function() {
    $caht.removeClass("caht"),
    $(window).scroll(()=>{
        let e = $(this).scrollTop()
          , f = $(document).height() / 2;
        0 === e ? ($header.removeClass("in"),
        $caht.removeClass("caht"),
        $header_top.css("display", "none")) : $header.addClass("in"),
        e > f && ($caht.addClass("caht"),
        $header_top.css("display", "flex"))
    }
    ),
    $header_top.click(()=>{
        $("html, body").animate({
            scrollTop: 0
        }, 1e3)
    }
    ),
    $elasticsearch.on({
      focusin: function() {
        if (typeof(Storage) !== "undefined") {
          if(($localStorage !== null) && ($localStorage !== "undefined")) {
            $datalist.html("");
            $datalist.append(dataList('Lịch sử tìm kiếm',false));
            for(let _arr of $localStorage) {
              $datalist.append(dataList(_arr,true));
            }
          }
        } else {
          alert('Trình duyệt của bạn đã cũ. Vui lòng nâng cấp trình duyệt để sử dụng tính năng này');
        }
      },
      keyup: function() {
        let $charKey = $(this).val().trim();
        socket.compress(true).emit('search', $charKey);
        ""===$charKey&&$datalist.html("");
      }
    }),
    $('#acp').click(function() {
      loi_page(null, false);
    }),
    $("a.Status--product").on("click", function(e) {
        e.preventDefault();
        let f = $(this).closest("div.biseller-column").attr("data-hideID")
          , g = $(this).children("input.hidden-poro").attr("data-val");
        $(this).closest("li").remove(),
        $.ajax({
          url: $uri+'/san-pham/tam-ngung/'+'?_csrf='+$('input[name=_csrf]').val(),
          type: 'PUT',
          dataType: "json",
          data: {
              Id: f,
              Stuta: g
          },
          cache: false,
          success: function(data) {
              reload_page();
            },
            error: function (error) {
              loi_page(error, true);
            }

        });
    }),
    $("a.Status--productD").on("click", function(e) {
        e.preventDefault();
        let f = $(this).closest("div.biseller-column").attr("data-hideID")
          , g = $(this).children("input.hidden-poro").attr("data-val");
        $(this).closest("li").remove(),
        $.ajax({
          url: $uri+'/san-pham/mo-ban/'+'?_csrf='+$('input[name=_csrf]').val(),
          type: 'PUT',
          dataType: "json",
          data: {
              Id: f,
              Stuta: g
          },
          cache: false,
          success: function(data) {
              reload_page();
            },
            error: function (error) {
              loi_page(error, true);
            }
        });
    })
});
"undefined" != typeof Storage ? sessionStorage.setItem("dataId", 0) : console.log("Không có sessionStorage");
"undefined" != typeof Storage ? sessionStorage.setItem("dataEId", 0) : console.log("Không có sessionStorage");
