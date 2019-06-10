$(document).ready(function() {
    $('a').click(function(event) { //Плавное перемещение по якорям
        event.preventDefault();
        var id  = $(this).attr('href'),
            top = $(id).offset().top;
        $('body,html').animate({scrollTop: top}, 1000);
    });
    
    new Vue({
        el: '#nav',
        data: {
            nav: []
        },
        created() {
            axios
                .get('https://frontend-test-assignment-api.abz.agency/api/v1/users/1')
                .then(response => {
                    this.nav.push({ //Отображение пользователя в навбаре
                        name: response.data.user.name,
                        email: response.data.user.email,
                        photo: response.data.user.photo
                    });
                });
        },
        methods: { //Функции сайдбара
            showNav: function() {
                $('.sidenav').css('width', '250px');
                $('nav, .first-section').addClass('is-dimmed');
            },
            outside: function() {
                let sidenav = $('.sidenav').css('width');
                $('.navbar-toggler').click(function() {
                    if(sidenav == '0px') {
                        $('.sidenav').css('width', '250px');
                    }
                })
                if(sidenav == '250px') {
                    $('.sidenav').css('width', '0px');
                    $('nav, .first-section').removeClass('is-dimmed');
                }
            }
        },
        directives: {
            'click-outside': { //Функция, определяющая клик не по сайдбару
              bind: function(el, binding, vNode) {
                const bubble  = binding.modifiers.bubble
                const handler = (e) => {
                  if (bubble || (!el.contains(e.target) && el !== e.target)) {
                    binding.value(e)
                  }
                }

                document.addEventListener('click', handler)
              },
            }
          }
    });

    let print_users = new Vue({ //Получение юзеров в блок "Our cheerful users"
        el: '#task-2',
        data: {
            users: [],
            visible: true
        },
        created() {
            axios
                .get('https://frontend-test-assignment-api.abz.agency/api/v1/users?page=1&count=6')
                .then(response => {
                    for(let i = 0; i < response.data.users.length; i++) {
                        this.users.push({
                            name: response.data.users[i].name,
                            photo: response.data.users[i].photo,
                            phone: response.data.users[i].phone,
                            email: response.data.users[i].email,
                            position: response.data.users[i].position,
                            registration_timestamp: response.data.users[i].registration_timestamp,
                            link: response.data.links.next_url
                        });
                    };
                    this.users.sort(function(a, b) { //Сортировка по дате
                        return b.registration_timestamp - a.registration_timestamp
                    });
                })
        },
        methods: {
            next_url: function() { //Получение дополнительных 6 юзеров в блоке "Our cheerful users"
                var last_element = print_users.users[print_users.users.length - 1];
                if(last_element.link == null) { //Скрытие кнопки "Show more", если пользователей в БД нет
                    this.visible = false;
                };
                axios
                    .get(last_element.link)
                    .then(response => {
                        for(let i = 0; i < response.data.users.length; i++) {
                            this.users.push({
                                name: response.data.users[i].name,
                                photo: response.data.users[i].photo,
                                phone: response.data.users[i].phone,
                                email: response.data.users[i].email,
                                position: response.data.users[i].position,
                                registration_timestamp: response.data.users[i].registration_timestamp,
                                link: response.data.links.next_url
                            });
                        };
                        this.users.sort(function(a, b) {
                            return b.registration_timestamp - a.registration_timestamp
                        });
                        if(response.data.users.length < 6) { //Скрытие кнопки "Show more", если пользователей в БД нет (№2 для предотвращения багов)
                            this.visible = false;
                        }
                    })
            }
        }
    });
    
    let registration = new Vue({ //Отправка нового юзера на сервер методом POST
        el: '#Registration',
        data: {
            files: "Upload your photo",
            items: [],
            token: []
        },
        created() {
            axios
                .get('https://frontend-test-assignment-api.abz.agency/api/v1/positions')
                .then(response => {
                    for(let i = 0; i < response.data.positions.length; i++) {
                        this.items.push({
                            position_id: response.data.positions[i].id,
                            name: response.data.positions[i].name
                        });
                    }
                });
            axios
                .get('https://frontend-test-assignment-api.abz.agency/api/v1/token')
                .then(response => {
                    this.token.push({
                        token: response.data.token
                    })
                })
        },
        methods: {
            postPost() { //Функция, которая отрабатывает по нажатию на кнопку "Sign up"
                var formData  = new FormData(), //Объект с данными нового пользователя 
                    fileField = document.querySelector('input[type="file"]'),
                    select    = $("select :selected").val();
                formData.append('position_id', select);
                formData.append('name', $('#name').val());
                formData.append('email', $('#email').val());
                formData.append('phone', $('#phone').val());
                formData.append('photo', fileField.files[0]);
                
                axios.post("", formData, 
                {
                    headers: 
                    {
                        'Token': registration.token[0].token 
                    }
                }).then(response => { 
                    if(response.data.success == true) {
                        $('#modal').modal('toggle') //Модальное окно, если пользователь успешно зарегистрирован
                    }
                })
                .catch(error => {
                    if(error.response.data.fails) { //Красные рамки у неправильно заполненных полей
                        let el1 = '.form-group:eq(0)',
                            el2 = '.form-group:eq(1)',
                            el3 = '.form-group:eq(2)',
                            el4 = '.form-group:eq(3)',
                            el5 = '.form-group:eq(4)';
                        if(error.response.data.fails.name) {
                            $(el1).css('border', '1px solid red').css('color', 'red');
                        } else {
                            $(el1).css('border', '1px solid #CCCCCC').css('color', '#CCCCCC');
                        }
                        if(error.response.data.fails.email) {
                            $(el2).css('border', '1px solid red').css('color', 'red');
                        } else {
                            $(el2).css('border', '1px solid #CCCCCC').css('color', '#CCCCCC');
                        }
                        if(error.response.data.fails.phone) {
                            $(el3).css('border', '1px solid red').css('color', 'red');
                        } else {
                            $(el3).css('border', '1px solid #CCCCCC').css('color', '#CCCCCC');
                        }
                        if(error.response.data.fails.position_id) {
                            $(el4).css('border', '1px solid red').css('color', 'red');
                        } else {
                            $(el4).css('border', '1px solid #CCCCCC').css('color', '#000');
                        }
                        if(error.response.data.fails.photo) {
                            $(el5).css('border', '1px solid red').css('color', 'red');
                        } else {
                            $(el5).css('border', '1px solid #CCCCCC').css('color', '#CCCCCC');
                        }
                    }
                });
            },
            previewFiles(event) { //Функция для отображения названия файла в input type file
                this.files = event.target.files[0].name;
            }
        }
    });
})