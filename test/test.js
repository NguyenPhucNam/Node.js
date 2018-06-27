"use strict";
//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let assert = require('assert');
let server = require('../index');
let config = require('../config/default');
let expect = chai.expect;
let should = chai.should();
let mongoose = require("mongoose"),
    Product = require('../Models/Product'),
    Account = require('../Models/Account'),
    About = require('../Models/About'),
    Product_Type = require('../Models/Product_Type'),
    request = require('supertest'),
    jsdom;
    try {
      jsdom = require("jsdom/lib/old-api.js"); // jsdom >= 10.x
    } catch (e) {
      jsdom = require("jsdom"); // jsdom <= 9.x
    }

chai.use(chaiHttp);

//Van Lang Market
describe('Van Lang Market 👻', () => {
    let token;
    let cookies;
    let tokenAdmin;
    let cookiesAdmin;
    beforeEach((done) => {
      done();
    });

    // Không cần đăng nhập

     describe('/ Trang chu', () => {
       it('it should GET all the Product and Product_Type of Product', (done) => {
         request(server)
         .get('/')
         .expect(200)
         .expect(/Chợ tốt Văn Lang/, done)
       });
     });


     describe('/CMU/K21T18/final Trang chu', () => {
       it('it should GET all the Product and Product_Type of Product', (done) => {
         chai.request(server)
         .get(config.Path)
         .end((err, res) => {
           if (err) return done(err);
             res.should.have.status(200);
             res.body.should.be.a('object');
             res.type.should.equal('text/html');
           done();
         });
       });
     });

      describe('/CMU/K21T18/final/danh-muc/:id Danh muc', () => {

        it('it should GET id the Product_Type', (done) => {
          let id = "5af85f65419cadab24fbc6ad";
          request(server)
          .get(config.Path+'danh-muc/'+id)
          .expect(200)
          .expect(/Danh mục/, done)
        });

          it('it should not GET id the Product_Type', (done) => {
            let id = "5af85f65419";
            request(server)
            .get(config.Path+'danh-muc/'+id)
            .expect(404)
            .expect(/Not Found/, done)
           });

       });


     describe('/CMU/K21T18/final/gioi-thieu Gioi thieu', () => {
       it('it should GET about', (done) => {
         chai.request(server)
         .get(config.Path+'gioi-thieu')
         .end((err, res) => {
           if (err) return done(err);
             res.should.have.status(200);
             res.body.should.be.a('object');
             res.type.should.equal('text/html');
           done();
         });
       });
     });


      describe('/CMU/K21T18/final/san-pham/chi-tiet-san-pham/:id Product Details', () => {
        it('it should GET id the Product', (done) => {
          let id = "5b0ae5aa0315bf36d4b00206";
          request(server)
          .get(config.Path+'san-pham/chi-tiet-san-pham/'+id)
          .expect(200)
          .expect(/Chi tiết sản phẩm/, done)
        });

          it('it should not GET id the Product', (done) => {
            let id = "5b0ae5aa031";
            request(server)
            .get(config.Path+'san-pham/chi-tiet-san-pham/'+id)
            .expect(404)
            .expect(/Not Found/, done)
           });
      });


      // Bắt buộc phải đăng nhập
      describe('/CMU/K21T18/final/tai-khoan/dang-nhap Login', () => {

        beforeEach((done) => {
          request(server)
            .get(config.Path+'admin/dang-nhap')
            .expect(200)
            .end((err, resp) => {
              if(err) return new Error(err);
              // lay cookies
              cookies = resp.headers['set-cookie'];
              // lay token
              jsdom.env(resp.text, (err, window) => {
                if(err) return new Error(err + "");
                token = window.document.getElementsByName('_csrf')[0].value;
                done();
              });
            });
          });

        it('success login', (done) => {
          request(server)
            .post(config.Path+'tai-khoan/dang-nhap')
            .type('form')
            .set('Cookie', cookies)
            .send({
              _csrf: token,
              email: 'nam@gmail.com',
              password: 'asdasd'
            })
            .expect(302)
            .expect('Location', config.Path, done)
          });

        it('failure login', (done) => {
          request(server)
            .post(config.Path+'tai-khoan/dang-nhap')
            .type('form')
            .set('Cookie', cookies)
            .send({
              _csrf: token,
              email: 'na@gmail.com',
              password: 'asdasd'
            })
            .expect(302)
            .end((err, res) => {
              if (err) return done(err);
              res.header['location'].should.include(config.Path+'tai-khoan/dang-nhap')
              done()
            });
            //.expect('Location', /\/CMU\/K21T18\/final\/tai-khoan\/dang-nhap/, done)
          });

        // Vào kênh người bán
        describe('/CMU/K21T18/final/kenh-nguoi-ban Kênh người bán', () => {

          let isLogin = (done) => {
            request(server)
            .get(config.Path+'kenh-nguoi-ban')
            .expect(302)
            .expect('Location', config.Path+'tai-khoan/dang-nhap', () => {
              request(server)
              .get(config.Path+'tai-khoan/dang-nhap')
              .expect(200)
              .expect(/Đăng nhập/, () => {
                request(server)
                  .post(config.Path+'tai-khoan/dang-nhap')
                  .type('form')
                  .set('Cookie', cookies)
                  .send({
                    _csrf: token,
                    email: 'nam@gmail.com',
                    password: 'asdasd'
                  })
                  .expect(302)
                  .redirects(0)
                  .end(done)
              })
            })
          }

          // kênh người bán
          it('it should be done when it login with user Accept', (done) => {
            isLogin(done);
          });

          //view list of seller product
          it('it should show view list of seller product ', (done) => {
            isLogin(done);
          });

          it('it should not done when it login with user Agree', (done) => {
            request(server)
            .get(config.Path+'kenh-nguoi-ban')
            .expect(302)
            .expect('Location', config.Path+'tai-khoan/dang-nhap', () => {
              request(server)
              .get(config.Path+'tai-khoan/dang-nhap')
              .expect(200)
              .expect(/Đăng nhập/, () => {
                request(server)
                  .post(config.Path+'tai-khoan/dang-nhap')
                  .type('form')
                  .set('Cookie', cookies)
                  .send({
                    _csrf: token,
                    email: 'a@gmail.com',
                    password: 'asdasd'
                  })
                  .expect(200)
                  .redirects(config.Path+'tai-khoan/cho-duyet')
                  .end(done)
              })
            })
          });

          //Status product
          describe('/CMU/K21T18/final/san-pham/tam-ngung tam ngung ban', () => {

            // ngừng bán sản phẩm
            it('it should done tam ngung ban (Success)', (done) => {
              request(server)
              .get(config.Path+'kenh-nguoi-ban')
              .expect(302)
              .expect('Location', config.Path+'tai-khoan/dang-nhap', () => {
                request(server)
                .get(config.Path+'tai-khoan/dang-nhap')
                .expect(200)
                .expect(/Đăng nhập/, () => {
                  request(server)
                    .post(config.Path+'tai-khoan/dang-nhap')
                    .type('form')
                    .set('Cookie', cookies)
                    .send({
                      _csrf: token,
                      email: 'nam@gmail.com',
                      password: 'asdasd'
                    })
                    .expect(302)
                    .redirects(0)
                    .end((err, res) => {
                      if(err) return new Error(err);
                      request(server)
                      .put(config.Path+'san-pham/tam-ngung/?_csrf='+token)
                      .set('Cookie', cookies)
                      .set('Content-Type', 'application/json')
                      .set('cache', false)
                      .send({
                        Id: '5b0ed314cccc4f30cc809bbe',
                        Stuta: 'false'
                      })
                      .expect(200)
                      .end((err, res) => {
                        if (err) throw err;
                        done();
                      });
                    })
                })
              })
            });

          });

          // mở bán sản phẩm
          describe("/CMU/K21T18/final/san-pham/mo-ban mo-ban", () => {
            it('it should done mo-ban (Success)', (done) => {
              request(server)
              .get(config.Path+'kenh-nguoi-ban')
              .expect(302)
              .expect('Location', config.Path+'tai-khoan/dang-nhap', () => {
                request(server)
                .get(config.Path+'tai-khoan/dang-nhap')
                .expect(200)
                .expect(/Đăng nhập/, () => {
                  request(server)
                    .post(config.Path+'tai-khoan/dang-nhap')
                    .type('form')
                    .set('Cookie', cookies)
                    .send({
                      _csrf: token,
                      email: 'nam@gmail.com',
                      password: 'asdasd'
                    })
                    .expect(302)
                    .redirects(0)
                    .end((err, res) => {
                      if(err) return new Error(err);
                      request(server)
                      .put(config.Path+'san-pham/mo-ban/?_csrf='+token)
                      .set('Cookie', cookies)
                      .set('Content-Type', 'application/json')
                      .set('cache', false)
                      .send({
                        Id: '5b0ed314cccc4f30cc809bbe',
                        Stuta: 'true'
                      })
                      .expect(200)
                      .end((err, res) => {
                        if (err) throw err;
                        done();
                      });
                    })
                })
              })
            });

          });

          // Thêm sản phẩm
          describe('/CMU/K21T18/final/san-pham/them-san-pham add product', () => {

            // Success
            it('it should done when it login and fee pay with Account(Success)', (done) => {
              request(server)
              .get(config.Path+'kenh-nguoi-ban')
              .expect(302)
              .expect('Location', config.Path+'tai-khoan/dang-nhap', () => {
                request(server)
                .get(config.Path+'tai-khoan/dang-nhap')
                .expect(200)
                .expect(/Đăng nhập/, () => {
                  request(server)
                    .post(config.Path+'tai-khoan/dang-nhap')
                    .type('form')
                    .set('Cookie', cookies)
                    .send({
                      _csrf: token,
                      email: 'nam@gmail.com',
                      password: 'asdasd'
                    })
                    .expect(302)
                    .redirects(0)
                    .end((err) => {
                      if(err) return new Error(err);
                      request(server)
                      .get(config.Path+'san-pham/them-san-pham')
                      .expect(200)
                      .redirects(config.Path+'san-pham/them-san-pham')
                      .end((err) => {
                        if(err) return new Error(err);
                        request(server)
                        .post(config.Path+'san-pham/them-san-pham/?_csrf='+token)
                        .type('form')
                        .set('Cookie', cookies)
                        .send({
                          imgs: 'a.jpg,b.png',
                          Product_Name: 'Bưởi',
                          Description: 'Bưởi tươi',
                          Product_Type: '5af85f65419cadab24fbc6ad',
                          Price: 15000,
                          Quantity: 1
                        })
                        .expect(302)
                        .end((err, res) => {
                          if (err) return done(err);
                          res.header['location'].should.include(config.Path)
                          done()
                        });
                        //.expect('Location', /\/CMU\/K21T18\/final/, done)
                      })
                    })
                })
              })
            });

            // failure beacuse it don't have Image
            it('it should done when it login and fee pay with Account(failure Image)', (done) => {
              request(server)
              .get(config.Path+'kenh-nguoi-ban')
              .expect(302)
              .expect('Location', config.Path+'tai-khoan/dang-nhap', () => {
                request(server)
                .get(config.Path+'tai-khoan/dang-nhap')
                .expect(200)
                .expect(/Đăng nhập/, () => {
                  request(server)
                    .post(config.Path+'tai-khoan/dang-nhap')
                    .type('form')
                    .set('Cookie', cookies)
                    .send({
                      _csrf: token,
                      email: 'nam@gmail.com',
                      password: 'asdasd'
                    })
                    .expect(302)
                    .redirects(0)
                    .end((err) => {
                      if(err) return new Error(err);
                      request(server)
                      .get(config.Path+'san-pham/them-san-pham')
                      .expect(200)
                      .redirects(config.Path+'san-pham/them-san-pham')
                      .end((err) => {
                        if(err) return new Error(err);
                        request(server)
                        .post(config.Path+'san-pham/them-san-pham/?_csrf='+token)
                        .type('form')
                        .set('Cookie', cookies)
                        .send({
                          Product_Name: 'Bưởi',
                          Description: 'Bưởi tươi',
                          Product_Type: '5af85f65419cadab24fbc6ad',
                          Price: 15000,
                          Quantity: 1
                        })
                        .expect(302)
                        .end((err, res) => {
                          if (err) return done(err);
                          res.header['location'].should.include(config.Path+'san-pham/them-san-pham')
                          done()
                        });
                        //.expect('Location', /\/CMU\/K21T18\/final\/san-pham\/them-san-pham/, done)
                      })
                    })
                })
              })
            });

          });

          // Update sản phẩm
          describe('/CMU/K21T18/final/san-pham/update-san-pham/:id update product', () => {
            it('it should done Update success', (done) => {
              let id = "5b2b13c561222143b8434769";
              request(server)
              .get(config.Path+'kenh-nguoi-ban')
              .expect(302)
              .expect('Location', config.Path+'tai-khoan/dang-nhap', () => {
                request(server)
                .get(config.Path+'tai-khoan/dang-nhap')
                .expect(200)
                .expect(/Đăng nhập/, () => {
                  request(server)
                    .post(config.Path+'tai-khoan/dang-nhap')
                    .type('form')
                    .set('Cookie', cookies)
                    .send({
                      _csrf: token,
                      email: 'nam@gmail.com',
                      password: 'asdasd'
                    })
                    .expect(302)
                    .redirects(0)
                    .end((err) => {
                      if(err) return new Error(err);
                      request(server)
                      .get(config.Path+'san-pham/update-san-pham/'+id)
                      .expect(200)
                      .redirects(config.Path+'san-pham/update-san-pham/'+id)
                      .end((err) => {
                        if(err) return new Error(err);
                        request(server)
                        .post(config.Path+'san-pham/update-san-pham/'+id+'/?_csrf='+token)
                        .type('form')
                        .set('Cookie', cookies)
                        .send({
                          imgs: 'buoia.jpg,buoib.png',
                          Product_Name: 'Bưởi dưới quê',
                          Description: 'Bưởi tươi dưới quê',
                          Product_Type: '5af85f65419cadab24fbc6ad',
                          Price: 25000,
                          Quantity: 100
                        })
                        .expect(302)
                        .end((err, res) => {
                          if (err) return done(err);
                          res.header['location'].should.include(config.Path+'kenh-nguoi-ban')
                          done()
                        });
                      })
                    })
                })
              })
            });
          });


        });

        describe(config.Path+'tai-khoan/dang-xuat', () => {
          it('it should logout success', (done) => {
            request(server)
            .get(config.Path+'kenh-nguoi-ban')
            .expect(302)
            .expect('Location', config.Path+'tai-khoan/dang-nhap', () => {
              request(server)
              .get(config.Path+'tai-khoan/dang-nhap')
              .expect(200)
              .expect(/Đăng nhập/, () => {
                request(server)
                  .post(config.Path+'tai-khoan/dang-nhap')
                  .type('form')
                  .set('Cookie', cookies)
                  .send({
                    _csrf: token,
                    email: 'testchototvl@gmail.com',
                    password: 'asdasd'
                  })
                  .expect(302)
                  .redirects(0)
                  .expect(/Kênh người bán/, () => {
                    request(server)
                    .get(config.Path+"tai-khoan/dang-xuat")
                    .expect(302)
                    .end((err,res) => {
                      if(err) throw new Error(err);
                      res.header['location'].should.include(config.Path)
                      res.text.should.not.contain("PhucNam");
                      done();
                    });
                  });
              });
            });
          });
        });

      });

      describe('/CMU/K21T18/final/tai-khoan/dang-ky Register', () => {

        // Register Success
        it('it should Register Success', (done) => {
          request(server)
          .get(config.Path+'tai-khoan/dang-ky')
          .expect(200)
          .expect(/Đăng ký/, () => {
            request(server)
            .post(config.Path+'tai-khoan/dang-ky')
            .type('form')
            .set('Cookie', cookies)
            .send({
              _csrf: token,
              username: "unitTest",
              email: 'unitTest@gmail.com',
              phone: "0123456789",
              password: 'asdasd'
            })
            .expect(200)
            .redirects(config.Path+'tai-khoan/cho-duyet')
            .end(done)
          })
        });

        // Register Failure
        it('it should Register Failure', (done) => {
          request(server)
          .get(config.Path+'tai-khoan/dang-ky')
          .expect(200)
          .expect(/Đăng ký/, () => {
            request(server)
            .post(config.Path+'tai-khoan/dang-ky')
            .type('form')
            .set('Cookie', cookies)
            .send({
              _csrf: token,
              username: "unitTest",
              email: 'a@gmail.com',
              phone: "0123456789",
              password: 'asdasd'
            })
            .expect(302)
            .expect('Location', config.Path+'tai-khoan/dang-ky', done)
          })
        });

      });

      // send-mail-to-seller
      describe('/gui-mail send-mail-to-seller', () => {
        it("it should success sendmail", (done) => {
          let id = "5b2b1e0961222143b843476a"; //khai báo 1 ID của sản phẩm phải có trong db
          //từ trang chủ
          request(server) //gọi tới server
          .get(config.Path+'san-pham/chi-tiet-san-pham/'+id) // yêu cầu server cho xem trang chi tiết của sản phẩm có id như trên
          .expect(200) //thành công là 200,
          //.expect(/Chi tiết sản phẩm/, done) //HIển thị trang chi tiết của sản phẩm có id như trên
          .expect(/Chi tiết sản phẩm/, () => {
            // chữ done là tiếp tục hành trình send mail bỏ done thêm () => {} có có hiểu là tạo 1 hàm để chạy tiếp sau khi vào xem chi tiết
            let soluong = 1; //test thành công thì số lượng phải nhỏ hơn số lượng sản phẩm có và test thất bại thì ngược lại
            request(server) //gọi tới server
            .get(config.Path+"san-pham/gui-mail/"+id+"&"+soluong) // yêu cầu server cho cái view gửi mail của sản phẩm có id và số lượng như trên
            .expect(200)
            .expect(/Gửi liên hệ sản phẩm/, () => {
              let kho = 1;
              let tyle = 'kg';
              request(server)
              .post(config.Path+'san-pham/gui-mail/'+id+'&'+tyle+'&'+kho)
              .type('form')
              .set('Cookie', cookies) //bảo mật
              .send({
                _csrf: token, //bảo mật
                tieude: "unitTest",  //tieude,ten,sdt,.. là name trong input của html
                ten: 'unitTest@gmail.com',
                sdt: "0123456789",
                soluong: soluong,
                email: 'unitTest@gmail.com',
                noidung: "0123456789"
              }) //gửi thông tin trong form
              .expect(200)
              .redirects(config.Path+'san-pham/gui-mail/'+id+"&1")
              .end((err,res) => {
                if (err) return done(err);
                res.text.should.contain('Liên hệ đã được gửi');
                done();
              });
            })
          });
        });

        it("it should failure sendmail because not name", (done) => {
          let id = "5b2b1e0961222143b843476a"; //khai báo 1 ID của sản phẩm phải có trong db
          //từ trang chủ
          request(server) //gọi tới server
          .get(config.Path+'san-pham/chi-tiet-san-pham/'+id) // yêu cầu server cho xem trang chi tiết của sản phẩm có id như trên
          .expect(200) //thành công là 200,
          //.expect(/Chi tiết sản phẩm/, done) //HIển thị trang chi tiết của sản phẩm có id như trên
          .expect(/Chi tiết sản phẩm/, () => {
            // chữ done là tiếp tục hành trình send mail bỏ done thêm () => {} có có hiểu là tạo 1 hàm để chạy tiếp sau khi vào xem chi tiết
            let soluong = 1; //test thành công thì số lượng phải nhỏ hơn số lượng sản phẩm có và test thất bại thì ngược lại
            request(server) //gọi tới server
            .get(config.Path+"san-pham/gui-mail/"+id+"&"+soluong) // yêu cầu server cho cái view gửi mail của sản phẩm có id và số lượng như trên
            .expect(200)
            .expect(/Gửi liên hệ sản phẩm/, () => {
              let kho = 1;
              let tyle = 'kg';
              request(server)
              .post(config.Path+'san-pham/gui-mail/'+id+'&'+tyle+'&'+kho)
              .type('form')
              .set('Cookie', cookies) //bảo mật
              .send({
                _csrf: token, //bảo mật
                tieude: "unitTest",  //tieude,ten,sdt,.. là name trong input của html
                // ten: 'unitTest@gmail.com',
                sdt: "0123456789",
                soluong: soluong,
                email: 'unitTest@gmail.com',
                noidung: "0123456789"
              }) //gửi thông tin trong form
              .expect(200)
              .redirects(config.Path+'san-pham/gui-mail/'+id+"&"+soluong)
              .end((err,res) => {
                if (err) return done(err);
                res.text.should.contain('Họ và tên không được trống');
                done();
              });
            })
          });
        });
        //
        it("it should failure sendmail Quantity bigger than Storage", (done) => {
          let id = "5b2b1e0961222143b843476a"; //khai báo 1 ID của sản phẩm phải có trong db
          //từ trang chủ
          request(server) //gọi tới server
          .get(config.Path+'san-pham/chi-tiet-san-pham/'+id) // yêu cầu server cho xem trang chi tiết của sản phẩm có id như trên
          .expect(200) //thành công là 200,
          //.expect(/Chi tiết sản phẩm/, done) //HIển thị trang chi tiết của sản phẩm có id như trên
          .expect(/Chi tiết sản phẩm/, () => {
            // chữ done là tiếp tục hành trình send mail bỏ done thêm () => {} có có hiểu là tạo 1 hàm để chạy tiếp sau khi vào xem chi tiết
            let soluong = 1; //test thành công thì số lượng phải nhỏ hơn số lượng sản phẩm có và test thất bại thì ngược lại
            request(server) //gọi tới server
            .get(config.Path+"san-pham/gui-mail/"+id+"&"+soluong) // yêu cầu server cho cái view gửi mail của sản phẩm có id và số lượng như trên
            .expect(200)
            .expect(/Gửi liên hệ sản phẩm/, () => {
              let kho = 1;
              let tyle = 'kg';
              request(server)
              .post(config.Path+'san-pham/gui-mail/'+id+'&'+tyle+'&'+kho)
              .type('form')
              .set('Cookie', cookies) //bảo mật
              .send({
                _csrf: token, //bảo mật
                tieude: "unitTest",  //tieude,ten,sdt,.. là name trong input của html
                ten: 'unitTest@gmail.com',
                sdt: "0123456789",
                soluong: 5,
                email: 'unitTest@gmail.com',
                noidung: "0123456789"
              }) //gửi thông tin trong form
              .expect(200)
              .redirects(config.Path+'san-pham/gui-mail/'+id+"&1")
              .end((err,res) => {
                if (err) return done(err);
                res.text.should.contain('Số lượng không được lớn hơn số lượng kho');
                done();
              });
            })
          });
        })

      });


      describe('/lien-he send-mail-to-company', () => {
        it("it should send mail to company success",(done) => {
          request(server)
          .get(config.Path+'lien-he')
          .expect(200)
          .expect(/Liên hệ với chúng tôi/, () => {
            request(server)
            .post(config.Path+'lien-he')
            .type('form')
            .set('Cookie', cookies) //bảo mật
            .send({
              _csrf: token, //bảo mật
              title: "unitTest",  //tieude,ten,sdt,.. là name trong input của html
              name: 'unitTest@gmail.com',
              phone: "0123456789",
              email: 'unitTest@gmail.com',
              content: "testUnittest"
            }) //gửi thông tin trong form
            .expect(200)
            .redirects(config.Path+'lien-he')
            .end((err,res) => {
              res.text.should.contain('Thành công! Liên hệ của bạn đã được gửi cho chúng tôi.')
              done();
            });
          });
        });
      });


  // Admin
  describe(config.Path+"admin/dang-nhap Admin", () => {

    // get token admin
    beforeEach((done) => {
      request(server)
        .get(config.Path+'admin/dang-nhap')
        .expect(200)
        .end((err, resp) => {
          if(err) return new Error(err);
          // lay cookies
          cookiesAdmin = resp.headers['set-cookie'];
          // lay token
          jsdom.env(resp.text, (err, window) => {
            if(err) return new Error(err);
            tokenAdmin = window.document.getElementsByName('_csrf')[0].value;
            done();
          });
        });
      });

    it("it should login admin success, auth", (done) => {
      request(server)
      .get(config.Path+"admin/dang-nhap")
      .expect(200)
      .expect(/Đăng nhập/, () => {
        request(server)
        .post(config.Path+"admin/dang-nhap")
        .type('form')
        .set('Cookie', cookiesAdmin) //bảo mật
        .send({
          _csrf: tokenAdmin, //bảo mật
          email: 'admin@gmail.com',
          password: "asdasd"
        }) //gửi thông tin trong form
        .expect(200)
        .redirects(config.Path+'admin/dashboard')
        .expect(/Dashboard/, done)
      });
    });


    describe('show detail and view list of seller', () => {
      it('it should show detail and view list of seller', (done) => {
        let id = "5afbb231370a0c2748242ed1";
        request(server)
        .get(config.Path+"admin/dang-nhap")
        .expect(200)
        .expect(/Đăng nhập/, () => {
          request(server)
          .post(config.Path+"admin/dang-nhap")
          .type('form')
          .set('Cookie', cookiesAdmin) //bảo mật
          .send({
            _csrf: tokenAdmin, //bảo mật
            email: 'admin@gmail.com',
            password: "asdasd"
          }) //gửi thông tin trong form
          .expect(200)
          .redirects(config.Path+'admin/dashboard')
          .expect(/Dashboard/, done)
        });
      });
    });

    describe('update status of Seller',()=>{
      it('it should update status of Seller', (done) => {
        let id = "5af85dd176fbe3b3a0235727";
        request(server)
        .get(config.Path+"admin/dang-nhap")
        .expect(200)
        .expect(/Đăng nhập/, () => {
          request(server)
          .post(config.Path+"admin/dang-nhap")
          .type('form')
          .set('Cookie', cookiesAdmin) //bảo mật
          .send({
            _csrf: tokenAdmin, //bảo mật
            email: 'admin@gmail.com',
            password: "asdasd"
          }) //gửi thông tin trong form
          .expect(200)
          .redirects(config.Path+'admin/dashboard')
          .end((err,res) => {
            if(err) throw new Error(err);
            request(server)
            .put(config.Path+"admin/trang-thai-tai-khoan/"+id+"/?_csrf="+tokenAdmin)
            .type('form')
            .set('Cookie', cookiesAdmin) //bảo mật
            .send({
              Status: true
            }) //gửi thông tin trong form
            .expect(200)
            .end((err,res) => {
              if(err) throw new Error(err);
              res.body.should.equal("Success");
              done();
            });
          });
        });
      });
    });

    describe(config.Path+'admin/tat-ca-san-pham it should show all data API products of ChototVanLang',() => {
     // Success
     it('it should show all data API products of ChototVanLang', (done) => {
       request(server)
       .get(config.Path+'dashboard')
       .expect(302)
       .expect('Location', config.Path+'admin/dang-nhap', () => {
         request(server)
         .get(config.Path+'admin/dang-nhap')
         .expect(200)
         .expect(/Đăng nhập/, () => {
           request(server)
             .post(config.Path+'admin/dang-nhap')
             .type('form')
             .set('Cookie', cookiesAdmin)
             .send({
               _csrf: tokenAdmin,
               email: 'admin@gmail.com',
               password: 'asdasd'
             })
             .expect(302)
             .redirects(0)
             .end(async (err) => {
               if(err) return new Error(err);
               await request(server)
               .get(config.Path+'admin/tat-ca-san-pham')
               .expect(200)
               .redirects(config.Path+'admin/tat-ca-san-pham')
               .end(async (err,res) => {
                 if(err) return new Error(err);
                 await res.text.should.contain('Tất cả');
                 done()
               })
             })
         })
       })
     });

    });

    describe('Statistic', ()=>{
      it('it should Statistic all user has quantity product sale max => min', (done) => {
        request(server)
        .get(config.Path+"admin/dang-nhap")
        .expect(200)
        .expect(/Đăng nhập/, () => {
          request(server)
          .post(config.Path+"admin/dang-nhap")
          .type('form')
          .set('Cookie', cookiesAdmin) //bảo mật
          .send({
            _csrf: tokenAdmin, //bảo mật
            email: 'admin@gmail.com',
            password: "asdasd"
          }) //gửi thông tin trong form
          .expect(302)
          .redirects(config.Path+'admin/dashboard')
          .end(async (err) => {
            if(err) return new Error(err);
              await request(server)
              .get(config.Path+'admin/thong-ke')
              .expect(200)
              .expect(/Thống kê/, done);
          });
        });
      });
    });


    describe('Logout Admin success', () => {
          it("it should logout admin success, auth", (done) => {
            request(server)
            .get(config.Path+"admin/dang-nhap")
            .expect(200)
            .expect(/Đăng nhập/, () => {
              request(server)
              .post(config.Path+"admin/dang-nhap")
              .type('form')
              .set('Cookie', cookiesAdmin) //bảo mật
              .send({
                _csrf: tokenAdmin, //bảo mật
                email: 'admin@gmail.com',
                password: "asdasd"
              }) //gửi thông tin trong form
              .expect(200)
              .redirects(config.Path+'admin/dashboard')
              .end((err,res) => {
                if(err) return new Error(err);
                request(server)
                .get(config.Path+"admin/dang-xuat")
                .expect(302)
                .end((err,res) => {
                  if(err) throw new Error(err);
                  res.header['location'].should.include(config.Path+'admin/dang-nhap')
                  res.text.should.not.contain("Admin");
                  done();
                });
              });
            });
          });
    })

  });


});
