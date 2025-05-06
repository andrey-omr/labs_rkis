///#region Глобальные переменные
const HOST = 'http://web-app.api-web-tech.local';
const CONTENT = document.querySelector('.content')
// var EDITED_FILE_ID;
///#endregion

///#region AJAX запрос
function _get(params, callback) {
    let HTTP_REQUEST = new XMLHttpRequest();
    HTTP_REQUEST.open('GET', `${params.url}`);
    HTTP_REQUEST.send();
    HTTP_REQUEST.onreadystatechange = function () {
        if (HTTP_REQUEST.readyState == 4) {
            callback(HTTP_REQUEST.responseText);
        }
    };
}
function _post(params, callback) {
    let HTTP_request = new XMLHttpRequest();
    HTTP_request.open('POST', `${params.url}`);
    HTTP_request.send(params.data);
    HTTP_request.onreadystatechange = function () {
        if (HTTP_request.readyState == 4) {
            callback(HTTP_request.responseText);
        }
    };
}
function _delete(params, callback) {
    let del = new XMLHttpRequest();
    del.open('DELETE', `${params.url}`, true);
    del.send(params.data)
    del.onreadystatechange = function () {
        if (del.readyState == 4) {
            callback(del.responseText)
        }
    }
}
///#endregion

///#region Функционал
function _elem(selector) {
    return document.querySelector(selector)
}

_get({ url: 'modules/authorization.html' }, function (response) {
    CONTENT.innerHTML = response

    onloadAuth()
})

function onloadAuth() {
    _elem('.authorize').addEventListener('click', function () {
        let request_data = new FormData();
        request_data.append('email', _elem('input[name="email"]').value);
        request_data.append('password', _elem('input[name="password"]').value);

        _post({url: `${HOST}/authorization`, data: request_data }, function (response) {
            response = JSON.parse(response);
            console.log(response);

            if (response.success) {
                TOKEN = response.token;
                _get({ url: '/modules/profile.html' }, function (response) {
                    CONTENT.innerHTML = response;
                    onLoadProf()
                });
            } else {
                _elem('.massage-block').innerHTML = '';
                _elem('.massage-block').append(response.massage);
            };
        });
    });
    _elem('.go-register').addEventListener('click', function () {
        _get({ url: '/modules/registration.html' }, function (response) {
            CONTENT.innerHTML = response;
            onLoadReg()
        });
    });
}

function onLoadProf() {
    let disk_url = `${HOST}/disk/?token=${TOKEN}`;

    _get({ url: disk_url }, function (response) {
        response = JSON.parse(response);
        makeTableData(response);
        console.log(response);
    });
    _elem('.btn-upload-file').addEventListener('click', function () {
        // console.log(TOKEN);
        _get({ url: 'modules/upload.html' }, function (response) {
            CONTENT.innerHTML = response;

            logoutUpload(), onLoadUpload()
        });
    });
}

function makeTableCell(content) {
    let cell = document.createElement('td');
    cell.textContent = content;
    return cell
}

function makeTableBtn(Text, onclick) {
    let cell = document.createElement('td');
    let btn = document.createElement('button');
    btn.textContent = Text;
    btn.onclick = onclick;
    cell.append(btn);
    return cell
}

function makeTableLink(href) {
    let cell = document.createElement('td');
    let link = document.createElement('a');
    link.textContent = href;
    link.setAttribute('href', `${HOST}`);
    link.setAttribute('target', '_blank');
    cell.append(link);
    return cell
}

function deleteFile(file_id, callback) {
    let url = `${HOST}/delete`;
    let f_Data = new FormData();
    f_Data.append('token', TOKEN);
    f_Data.append('id_file', file_id)
    _post({ url: url, data: f_Data }, callback)
}

function makeTableData(data) {
    let table = _elem('tbody');

    //Цикл по мaссиву data:
    data.forEach(element => {
        var row = document.createElement('tr');

        row.append(makeTableCell(element.file_id));
        row.append(makeTableCell(element.name));
        row.append(makeTableLink('Ссылка'));
        row.append(makeTableBtn('Удалить', function () {
            // deleteFile(element.file_id, function () {
                _get({ url: 'modules/delete.html' }, function (response) {
                    document.querySelector('.modal-content').innerHTML = response
                    document.querySelector('.modal').style = "display: block;"
                    console.log("до");

                    // onLoadEdit(element.file_id)
                    console.log("после");

                    // CONTENT.innerHTML = response;
                    onDelFile(element.file_id)
                })
            // })
        }));
        row.append(makeTableBtn('Изменить', function () {
            // EDITED_FILE_ID = element.file_id;
            _get({ url: 'modules/edit.html' }, function (response) {
                // CONTENT.innerHTML = response
                document.querySelector('.modal-content').innerHTML = response
                _elem('input[name="edit"]').value = element.name
                document.querySelector('.modal').style = "display: block;"
                onLoadEdit(element.file_id)
            })
        }));
        row.append(makeTableBtn('Изменить права'));

        table.appendChild(row);
    });
}

function onDelFile(file_id) {
    console.log("onDelFile()")
    let del_Data = new FormData();
    del_Data.append('token', TOKEN);
    del_Data.append('id_file', file_id)

    _elem('.btn-confirm-delete').addEventListener('click', function () {
        _post({ url: `${HOST}/delete`, data: del_Data }, function (response) {
            _get({ url: 'modules/profile.html' }, function (response) {
                CONTENT.innerHTML = response;
                onLoadProf()
            })
        })
    })


    _elem('.btn-cancel-delete').addEventListener('click', function () {
        document.querySelector('.modal-content').innerHTML = ''
        document.querySelector('.modal').style = "display: none;"
    })

}

function editFile(file_id, new_name) {
    let e_Data = new FormData();
    e_Data.append('name', new_name);
    e_Data.append('token', TOKEN);
    e_Data.append('id_file', file_id)
    _post({ url: `${HOST}/edit`, data: e_Data }, function () {
        // EDITED_FILE_ID = -1;
        _get({ url: 'modules/profile.html' }, function (response) {
            CONTENT.innerHTML = response;
            onLoadProf()
        })
    })
}


// function onLoadEdit() {
function onLoadEdit(id) {
    _elem('.e_btn').addEventListener('click', function () {
        // editFile(EDITED_FILE_ID ,_elem('input[name="edit"]').value)
        editFile(id, _elem('input[name="edit"]').value)

    })
}

function logoutUpload() {
    _elem('.btn-to-disk').addEventListener('click', function () {
        _get({ url: '/modules/profile.html' }, function (response) {
            // console.log(TOKEN)
            CONTENT.innerHTML = response;
            onLoadProf()
        });
    });
}

function onLoadUpload() {
    _elem('.upload-files').addEventListener('click', function () {
        let request_upload = new FormData();
        request_upload.append('token', TOKEN);
        request_upload.append('files', _elem('input[name="files"]').value);

        _post({ url: `${HOST}/download`, data: request_upload }, function (response) {
            // response = JSON.parse(response);
            console.log(response)

            _get({url: 'modules/profile.html'}, function(response) {
                CONTENT.innerHTML = response
                onLoadProf()
            })
        });
    });
}

function onLoadReg() {
    _elem('.register').addEventListener('click', function () {
        let request_regist = new FormData();
        request_regist.append('first_name', _elem('input[name="first_name"]').value);
        request_regist.append('last_name', _elem('input[name="last_name"]').value);
        request_regist.append('email', _elem('input[name="email"]').value);
        request_regist.append('password', _elem('input[name="password"]').value);

        _post({ url: `${HOST}/registration`, data: request_regist }, function (response) {
            response = JSON.parse(response);
            console.log(response);

            if (response.success) {
                TOKEN = response.token;
                _get({ url: '/modules/profile.html' }, function (response) {
                    CONTENT.innerHTML = response;
                    onLoadProf()
                });
            } else {
                _elem('.massage-block').innerHTML = 'Ошибка валидации';
                _elem('.massage-block').append()
            };
        });
    });
}
///#endregion