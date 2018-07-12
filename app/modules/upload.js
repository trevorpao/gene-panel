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

}(app, gee, jQuery));
