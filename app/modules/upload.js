;(function(app, gee, $){
    'use strict';

    app.upload = {
        checkDataParam: () => {
            let inputs = $('.gee__uploadingFile-dnd > input');
            let dataParams = [];
            for(let i = 0 ; i < inputs.length ; i++){
                dataParams.push($(inputs[i]).attr('data-param'));
            }
            return dataParams;
        },

        initContent: (pics) => {
            let moduleName = $('.gee__uploadingFile-dnd > input').attr('module');
            if(pics){
                // NOTE: 一頁可以有多個 uploaidng module，所以需要可以辨視多個 uploading module 要呈現已經有完成上傳的圖片預覽，根據：“data-pram”
                pics.forEach( (d) => {
                    let paramName = d.paramName;
                    app[moduleName][paramName].uploadFiles = [];
                    if(d.value){
                        let picsArray = d.value.split(',');

                        let removeDone = false;
                        picsArray.forEach( (pic, index) => {
                            let img = app.upload.makePicElement(pic, index);
                            let dndInputs = $('.gee__uploadingFile-dnd > input');

                            for(let i = 0 ; i < dndInputs.length ; i++){
                                if( $(dndInputs[i]).attr('data-param') === paramName ){
                                    if(!removeDone){
                                        $(dndInputs[i]).next('label').nextAll().remove();
                                        removeDone = true;
                                    }

                                    // img[0] : image element / img[1] : span for delete button.
                                    $(dndInputs[i]).closest('.gee__uploadingFile-dnd').append(img[0]);
                                    $(dndInputs[i]).closest('.gee__uploadingFile-dnd').append(img[1]);

                                    let src = $(img[0]).attr('src').match(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/)[3];
                                    app[moduleName][paramName].uploadFiles[index] = src;
                                }
                            }
                        });
                    }else{
                        let dndInputs = $('.gee__uploadingFile-dnd > input');
                        for(let i = 0 ; i < dndInputs.length ; i++){
                            let dndInput = $(dndInputs[i]);
                            if( dndInput.attr('data-param') == paramName ){
                                dndInput.next('label').nextAll().remove();
                            }
                        }
                    }
                });
            }
        },

        showFileName: function(file, box) {
            let reader = new FileReader();

            reader.onload = (e) => {
                box.find('.fuu-input-btn').text('Change');
                box.find('.fuu-clear, .fuu-upload').show();

                if (box.find('.fuu-filename').is('input')) {
                    box.find('.fuu-filename').val(file.name);
                }
                else {
                    box.find('.fuu-filename').txt(file.name);
                }
            };
            reader.readAsDataURL(file);
        },

        clearFileName: function(box) {
            box.find('.fuu-filename').val('');
            box.find('.fuu-clear, .fuu-upload').hide();
            box.find('.fuu-input input:file').val('');
            box.find('.fuu-input-btn').text('Browse');
        },

        progress: function(data, fileInput, box, mode) {
            let callback = function(rtn) {
                if (!rtn.code || rtn.code !== 1) {
                    app.stdErr(rtn);
                }
                else {
                    if (gee.isset(rtn.data.msg)) {
                        gee.alert({
                            title: 'Alert!',
                            txt: rtn.data.msg
                        });
                    }
                    app.upload.clearFileName(box);
                    box.find('.fuu-filename').val(rtn.data.filename);
                }
            };

            let fd = new FormData();
            let uri = (mode === 'pic') ? app.module.name +'/upload' : app.module.name +'/upload_file';
            fd.append(((mode === 'pic')?'photo':'file'), fileInput[0].files[0]);

            $.each(data, (idx, row) => {
                fd.append(row.name, row.value);
            });

            $.ajax({
                url: gee.apiUri + uri,
                data: fd,
                processData: false,
                contentType: false,
                type: 'POST',
                success: callback
            });
        },

        uploadingPic: (file, moduleName, dndArea) => {
            let fd = new FormData();
            let uri = moduleName +'/upload';
            fd.append('photo', file);

            return $.ajax({
                url: gee.apiUri + (moduleName + '/upload'),
                data: fd,
                processData: false,
                contentType: false,
                type: 'POST',
                async: true,
                beforeSend: function () {
                    $(dndArea.find('.file__loading-text')[0]).hide('slow');
                    $(dndArea.find('.file__uploading-progressbar')[0]).show('slow');
                },
                success: (rtn) => {
                    if (!rtn.code || rtn.code !== 1) {
                        $(dndArea.find('.file__loading-text')[0]).show('slow');

                        app.stdErr(rtn);
                        return new Promise( (resolve, reject) => {
                            resolve();
                        });
                    }
                    else {
                        if (gee.isset(rtn.data.msg)) {
                            gee.alert({
                                title: 'Alert!',
                                txt: rtn.data.msg
                            });
                        }
                        return new Promise( (resolve, reject) => {
                            resolve(rtn);
                        });
                    }
                }
            });
        },

        setUpDnD: ( dndArea, moduleName, multiple ) => {
            dndArea.get(0).ondragover = () =>{ return false; };
            dndArea.get(0).ondragend = () => { return false; };
            dndArea.get(0).ondrop = (e) => {
                e.preventDefault();

                let inputFiles = e.dataTransfer.files;
                let inputLength = e.dataTransfer.files.length;
                let promiseArray = [];
                for(let i = 0 ; i < inputLength ; i++){
                    promiseArray.push( app.upload
                        .uploadingPic(inputFiles[i], moduleName, dndArea) );
                }
                let jInputEle = $(dndArea.find('input')[0]);
                app.upload.doRest(inputFiles, promiseArray, moduleName, multiple, jInputEle);
            };
        },

        handlePicRemove: (e) => {
            let jtargetElement = $(e.target);
            let input = jtargetElement.closest('.gee__uploadingFile-dnd').find('input[type="file"]');
            let jimage = jtargetElement.closest('a').prev();

            let moduleName = input.attr('module');
            let dataParam = input.attr('data-param');
            let multipleAttr = input.attr('data-multiple');
            let uploadFiles = app[moduleName][dataParam].uploadFiles;


            // let breakException = {};
            uploadFiles = uploadFiles.filter( (f) => {
                return f !== jimage.attr('src').match(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/)[3];
            });

            if(uploadFiles.length !== 0 ){
                let valueOfPics = [];
                uploadFiles.forEach( (s) => {
                    valueOfPics.push(s);
                });

                let pics = {paramName: dataParam};
                pics.value = valueOfPics.toString();
                app.upload.initContent([pics]);
            }else{
                let pics = {paramName: dataParam};
                app.upload.initContent([pics]);
            }

            input.val('');
        },

        makePicElement: (e, index) => {
            let image = new Image();
            image.src = gee.picUri + (e).replace(/\/+/g, '/');
            image.style.width = '100%';

            //Make delete btn to provide remove uploaded pic
            let removeBtn = document.createElement("a");
            removeBtn.className += 'button is-danger btn__pic--remove';
            removeBtn.addEventListener('click', app.upload.handlePicRemove);

            let removeSpan = document.createElement("span");
            $(removeSpan).attr('index', index);
            removeSpan.innerHTML = "remove";
            removeBtn.appendChild(removeSpan);

            return [image, removeBtn];
        },

        // NOTE : see if need to change to use real file uri at storage instead of base64
        createImageNPreview: (files, parentEle, multipleAttr) => {
            // if(multipleAttr == 'replace'){
                // clean up existing pics.
                let existImgs = $(parentEle).find("img");
                if( existImgs.length !== 0 ){
                    for(let i = 0 ; i < existImgs.length ; i++){
                        $(existImgs[i]).next('a').remove();
                        existImgs[i].remove();
                    }
                }
            // }
            for( let i = 0 ; i < files.length ; i++ ){
                // NOTE : reader should be instanced here for avoiding action delay
                let imgs = app.upload.makePicElement( files[i], i);

                parentEle.appendChild(imgs[0]);
                parentEle.appendChild(imgs[1]);

                // let reader = new FileReader();
                // reader.onload =  (e) => {
                //     let img = app.upload.makePicElement(e, i);

                //     parentEle.appendChild(img[0]);
                //     parentEle.appendChild(img[1]);
                // };

                // reader.readAsDataURL(files[i]);
            }
        },

        doRest: (files, promiseArray, moduleName, multipleAttr, jInputEle)=> {
            let dndArea = jInputEle.closest('.gee__uploadingFile-dnd')[0];
            let dataParam = jInputEle.attr('data-param');

            Promise
                .all(promiseArray)
                .then( res => {
                    $($(dndArea).find('.file__uploading-progressbar')[0]).hide();
                    $($(dndArea).find('.file__loading-text')[0]).show('slow');

                    if(res){
                        //TODO: careateImageNPreview might need change to use return res.data.filename as src
                        // app.upload.createImageNPreview(files, dndArea, multipleAttr);

                        if(multipleAttr == 'replace'){
                            app[moduleName][dataParam].uploadFiles = [];
                        }

                        res.forEach( res => {
                            app[moduleName][dataParam].uploadFiles.push(res.data.filename);
                        });
                        app.upload.createImageNPreview(app[moduleName][dataParam].uploadFiles, dndArea, multipleAttr);
                    }
                });
        },

        addPics: (formSerializedArray, moduleName) => {
            let inputs = $('.gee__uploadingFile-dnd > input');
            for(let i = 0 ; i < inputs.length ; i++){
                let dataParam = $(inputs[i]).attr('data-param');
                formSerializedArray.push({
                    'name': dataParam,
                    'value': app[moduleName][dataParam].uploadFiles
                });
            }
            return formSerializedArray;
        }
    };

    gee.hook('passFile', function(me){
        let file = me[0].files[0];
        let $box = me.data('ta') ? $('#' + me.data('ta')) : me.closest('.fuu');
        app.upload.showFileName(file, $box);
    });

    gee.hook('uploadingFile', (me) => {
        let dndArea = $(me.closest('.gee__uploadingFile-dnd')[0]);
        let moduleName = me.attr('module');
        let multipleAttr = me.attr('data-multiple');
        let dataParam = me.attr('data-param');

        let files = me[0].files;
        let promiseArray = [];
        for(let i = 0 ; i < files.length ; i++){
            promiseArray.push( app.upload.uploadingPic(files[i], moduleName, dndArea) );
        }

        app.upload.doRest(files, promiseArray, moduleName, multipleAttr, me);
    });

    gee.hook('clearFile', function (me) {
        let $box = me.data('ta') ? $('#' + me.data('ta')) : me.closest('.fuu');
        app.upload.clearFileName($box);
    });

    gee.hook('upload', function(me){
        let $box = me.data('ta') ? $('#' + me.data('ta')) : me.closest('.fuu');
        let fileInput = $box.find('input:file');
        let mode = me.data('mode') || 'pic';

        if (fileInput.val() === '') {
            return false;
        }
        else {
            app.upload.progress({}, fileInput, $box, mode);
        }
    });

    gee.hook('upload/uploading', (me) => {
        let fileInput = $($(me.closest('.gee__uploadingFile-dnd')[0]).find('input')[0]);
        fileInput.trigger('click');
    });

    gee.hook('upload/dndUploading', (me) => {
        let dndArea = $(me.closest('.gee__uploadingFile-dnd')[0]);

        // clean up uloadFiles array
        let moduleName = me.attr('module');
        let multiple = me.attr('data-multiple');
        let dataParam = me.attr('data-param');

        if (!gee.isset(app[moduleName])) {
            app[moduleName] = {};
        }

        app[moduleName][dataParam] = {};
        app[moduleName][dataParam].uploadFiles = [];

        if(multiple){
            let inputFileEle = dndArea.find('input')[0];
            inputFileEle.multiple = true;
        }

        dndArea.on('click', function(e){
            e.stopPropagation();

            $(dndArea.find('input')[0]).on('click', (e)=> {
                e.stopPropagation();
            });
            $(dndArea.find('label')[0]).on('click', (e)=> {
                e.stopPropagation();
            });
            $(dndArea.find('input')[0]).trigger('click');
        });
        app.upload.setUpDnD(dndArea, moduleName, multiple);
    });

    gee.hook('largeclickarea', function (me) {
        let target = $(me.event.target)
        let selectName = target.attr('value') ? target.attr('name') + '-all' : me.find('input[type=checkbox]').attr('name') + '-all';
        let checkedEle = target.attr('value') ? target : me.find('input[type=checkbox]');

        if (!target.attr('value') && !target.is('a')) {
            me.find('input[type=checkbox]').each(function (index, c) {
                $(c).prop('checked', !$(c).prop("checked"));
            });
        }

        // synchonized check-all behavior
        let checkallEle = $(`input[name=${selectName}]`);
        if (checkallEle.is(':checked') && !checkedEle.is(":checked")) {
            checkallEle.prop('checked', false);
        } else if (!checkallEle.is(':checked') && checkedEle.is(':checked')) {
            let result = true;
            let checkboxes = $('tbody input[type="checkbox"]');

            for (let i = 0; i < checkboxes.length; i++) {
                if (!$(checkboxes[i]).is(":checked")) {
                    result = false;
                    break;
                }
            }

            if (result) {
                checkallEle.prop('checked', true);
            }
        }
    });

    gee.hookTag('gee\\:upload1', (me) => {
        me.each((idx) => {
            let cu = $(me[idx]);
            let param = cu.attr('data-param') ? cu.attr('data-param') : 'pic';
            let infoText = cu.attr('info-text') ? cu.attr('info-text') : '1200*800';

            let templateCode = app.tmplStores.upload1;
            if (!templateCode) {
                let htmlCode = '<div class="field fuu has-addons img-{{:param}}"> <p class="control"> <input type="text" name="{{:param}}" class="input fuu-filename" readonly="readonly" placeholder="{{:infoText}}"> </p> <p class="control"> <a class="button is-warning fuu-clear gee" data-gene="click:clearFile" style="display:none;">Clear</a> </p> <div class="button is-expanded fuu-input"> <span class="glyphicon glyphicon-folder-open"></span> <span class="fuu-input-btn">Browse</span> <input type="file" accept="image/png, image/jpeg, image/gif" class="gee" data-gene="change:passFile" /> </div> <p class="control"> <a class="button is-success fuu-upload gee" data-gene="click:upload" style="display:none;">Upload</a> </p> </div>';

                templateCode = $.templates(htmlCode);
                app.tmplStores.upload1 = templateCode;
            }

            cu.replaceWith(templateCode.render({ param: param, infoText: infoText }));
        });
    });

    gee.hookTag('gee\\:upload', (me) => {
        me.each((idx) => {
            let cu = $(me[idx]);
            let moduleName = cu.attr('module-name');
            let multiple = cu.attr('data-multiple');
            let param = cu.attr('data-param') ? cu.attr('data-param') : 'pic';
            let infoText = cu.attr('info-text') ? cu.attr('info-text') : '1200*800';

            let templateCode = app.tmplStores.upload;
            if (!templateCode) {
                let htmlCode = `<div class="gee__uploadingFile-dnd"><input type="file" accept="image/png, image/jpeg, image/gif" class="inputfile pre-gee" data-gene="change:uploadingFile" module={{:module}} data-multiple={{:multiple}} data-param={{:param}} /><label for="file"><div class="pre-gee" data-gene="init:upload/dndUploading,click:upload/uploading" module={{:module}} data-multiple={{:multiple}} data-param={{:param}}><div class="file__loading-text"><i class="fa fa-cloud-upload" aria-hidden="true"></i><strong>Choose a file</strong><span class="box__dragndrop"> or drag it here (NOTE:{{:infoText}})</span>.</div><div class="file__uploading-progressbar">Uploading...</div></div></label></div>`;

                htmlCode = htmlCode.replace(/pre-gee/g, 'gee');
                templateCode = $.templates(htmlCode);
                app.tmplStores.upload = templateCode;
            }

            cu.replaceWith(templateCode.render({ module: moduleName, multiple: multiple, param: param, infoText: infoText }));
        });
    });

}(app, gee, jQuery));
