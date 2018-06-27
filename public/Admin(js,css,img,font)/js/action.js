$(document).ready(function() {
  var toUser = [], spoUser = [],
  $url_link = $('a#logo_navbar_Apage').attr('href'),
  $url = $url_link.slice($url_link.indexOf("/"),1);
  $('.canvasjs-chart-canvas').css("position","unset");
  $('[data-ds="tooltip"]').tooltip();
  $('a.Status_Account').on('click', function(e) {
    e.preventDefault();
    const ida = $(this).attr('data-id');
    let childC = $(this).children('input[type=checkbox]').attr('data-controls');
    let userStatus = {
      Status: childC
    }
    if(childC === 'true') {
      $(this).children('input[type=checkbox]').attr('data-controls', 'false');
      $(this).children('div.dd').html('Đã duyệt');
    }
    if(childC === 'false') {
      $(this).children('input[type=checkbox]').attr('data-controls', 'true');
      $(this).children('div.dd').html('Chờ duyệt');
    }
    $.ajax({
      type: 'PUT',
      url: $url+'admin/trang-thai-tai-khoan/'+ida+'/?_csrf='+$("input#token").val(),
      data: userStatus,
      success: function(newStatus) {
        $('#thanhcong').css('opacity','1');
        setTimeout(function () {
          $('#thanhcong').css('opacity','0');
        }, 2000);
      },
      error: function(err){
        console.log(err);
      }
    });
  });

  $('.statitic').on('click', function() {
    let parentD = $(this).closest('tr').attr('data-id');
    let plus = `<em class="bnm">Sản phẩm</em>`;
    $('a#aUser').attr('href', $url+"admin/danh-sach-san-pham/"+parentD);
    $.ajax({
      type: 'GET',
      url: $url+'admin/thong-ke-ca-nhan/'+parentD,
      success: function(protype) {
        let month_arr = protype.arrJson.map(function(data_i){
          return data_i = data_i.y;
        });
        let total = month_arr.reduce(function(sum, value){ return value + sum; });
        $('.min-chart#chart-sales')
        .attr('data-percent',total);
        $('.min-chart#chart-sales')
        .find('.percent')
        .html(Math.round(total) + plus);
        //Tổng
        $('.min-chart#chart-sales').easyPieChart({
            barColor: "#4caf50",
            trackColor:	"#f2f2f2",
            scaleColor: "#dfe0e0",
            size:	150,
            lineWidth: 5,
            onStep: function (from, to, percent) {
                $(this.el)
                .find('.percent')
                .html(Math.round(total) + plus);
            }
        });
        //Tyle
        let options = {
          animationEnabled: true,
          data: [{
            type: "pie",
            startAngle: 40,
            toolTipContent: "<b>{label}</b>: {y}%",
            showInLegend: "true",
            legendText: "{label}",
            indexLabelFontSize: 16,
            indexLabel: '{label} - {y}%',
            dataPoints: protype.arrJson
          }]
        };
        $("#style--statistic").CanvasJSChart(options);
        let optionsYear = {
          animationEnabled: true,
          theme: "light2",
          title:{
            text: "Số sản phẩm trong tháng"
          },
          axisX:{
            valueFormatString: "DD MMM"
          },
          axisY: {
            // title: "Number of Sales",
            suffix: " sản phẩm",
            minimum: 30
          },
          toolTip:{
            shared:true
          },
          legend:{
            cursor:"pointer",
            verticalAlign: "bottom",
            horizontalAlign: "left",
            dockInsidePlotArea: true,
            itemclick: toogleDataSeries
          },
          data: [{
            type: "line",
            showInLegend: true,
            name: "Projected Sales",
            markerType: "square",
            xValueFormatString: "DD MMM, YYYY",
            color: "#F08080",
            yValueFormatString: "#,##0K",
            dataPoints: [
              { x: new Date(2017, 10, 1), y: 63 },
              { x: new Date(2017, 10, 2), y: 69 },
              { x: new Date(2017, 10, 3), y: 65 },
              { x: new Date(2017, 10, 4), y: 70 },
              { x: new Date(2017, 10, 5), y: 71 },
              { x: new Date(2017, 10, 6), y: 65 },
              { x: new Date(2017, 10, 7), y: 73 },
              { x: new Date(2017, 10, 8), y: 96 },
              { x: new Date(2017, 10, 9), y: 84 },
              { x: new Date(2017, 10, 10), y: 85 },
              { x: new Date(2017, 10, 11), y: 86 },
              { x: new Date(2017, 10, 12), y: 94 },
              { x: new Date(2017, 10, 13), y: 97 },
              { x: new Date(2017, 10, 14), y: 86 },
              { x: new Date(2017, 10, 15), y: 89 }
            ]
          },
          {
            type: "line",
            showInLegend: true,
            name: "Actual Sales",
            lineDashType: "dash",
            yValueFormatString: "#,##0K",
            dataPoints: [
              { x: new Date(2017, 10, 1), y: 60 },
              { x: new Date(2017, 10, 2), y: 57 },
              { x: new Date(2017, 10, 3), y: 51 },
              { x: new Date(2017, 10, 4), y: 56 },
              { x: new Date(2017, 10, 5), y: 54 },
              { x: new Date(2017, 10, 6), y: 55 },
              { x: new Date(2017, 10, 7), y: 54 },
              { x: new Date(2017, 10, 8), y: 69 },
              { x: new Date(2017, 10, 9), y: 65 },
              { x: new Date(2017, 10, 10), y: 66 },
              { x: new Date(2017, 10, 11), y: 63 },
              { x: new Date(2017, 10, 12), y: 67 },
              { x: new Date(2017, 10, 13), y: 66 },
              { x: new Date(2017, 10, 14), y: 56 },
              { x: new Date(2017, 10, 15), y: 64 }
            ]
          }]
      };
        $("#all--statistic").CanvasJSChart(optionsYear);

        function toogleDataSeries(e){
        	if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        		e.dataSeries.visible = false;
        	} else{
        		e.dataSeries.visible = true;
        	}
        	e.chart.render();
        }
      },
      error: function(err){
        console.log(err);
      }
    });
  });
});
