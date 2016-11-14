var lstFilter = [];
var socket = null;
var plSelected = null;


function createSelectFilter (li){

  var select = $("<select>",{"class":"form-control"}).change(function(){
    var optionSelected = $("option:selected", this);
    var valueSelected = this.value;

    $(this).parent("li").data("clip").idFilter = valueSelected;

  });
  select.append($("<option>").val(null).html("select one filter"));
  li.append(select);
  $.each(lstFilter, function(idx,item){
    select.append($("<option>").html(item.name).val(item.id));
  });
  select.val(li.data("clip").idFilter).change();
}

function renderClip(clip,withRemove) {

  var imgSrc = clip.thumbnails ? clip.thumbnails[0].path : "../public/img/file-video-icon.png" ;
  var content = "<span class='glyphicon glyphicon-facetime-video' aria-hidden='true'></span> "

                + "<div class='col-xs-3'><a href='# class='thumbnail'>"
                + "<img src='" + imgSrc +"' width=40px: height:40px; alt='...' /></a></div>"

                +clip.name
                ;
  if(withRemove){
      content = content +  "<span class= 'clipRemove glyphicon glyphicon-remove' style='float:right;cursor:pointer;'></span>";
  }
                //  + "<img src='" + clip.thumbnails ? "../public/img/file-video-icon.png" : clip.thumbnails[0].path + "' width=40px: height:40px; alt='...' /></a></div>"
  return content;

}

function renderPlaylists(plList) {
  //elimino lista de clips
  $("#plList button").remove();

  //creo un li por cada clip
  $.each(plList, function(idx,item){

    var li = $("<button>",{"id":idx,"class":"plOption btn btn-primary"}).html(
     item.name

   ).data("pl", item).click(function(){
     plSelected = $(this).data("pl");
     $("#plSelected").html(plSelected.name);
     renderPl(plSelected);
     $("#btnSave").prop("style","display:normal");
      $("#btnPlay").prop("style","display:normal");

   });

    $("#plList").append(li);
  });

}

//renderiza los clips de una playlist
function renderPl(pl) {
  //elimino lista de clips
  $("#playlist li").remove();

  lstClip = pl.clips;

  //creo un li por cada clip
  console.log(pl.clips);

  $.each(pl.clips, function(idx,clip){
    if(clip){
      var li = $("<li>",{"id":clip.id,"class":"ui-state-default", "style":"z-index:1000"}).html(renderClip(clip,true)).data("clip", clip);
      createSelectFilter(li);
      $("#playlist").append(li);

    }
  });

  $(".clipRemove").click(function(){
    $(this).parent("li").remove();
  })

}

function initSortables(){
  //creo listas ordenables y dropeables.
  $("#lstClip").sortable({
    connectWith: ".connectedSortable",

    helper: function (e, li) {
        this.copyHelper = li.clone().insertAfter(li);
        $(this).data('copied', false);

        return li.clone();
    },
    stop: function () {

        var copied = $(this).data('copied');

        if (!copied) {
            this.copyHelper.remove();
        }

        this.copyHelper = null;
    },
    receive: function( event, ui ) {
      ui.item.children("select").remove();

    }
  });

  $("#playlist").sortable({
      receive: function (e, ui) {
          ui.sender.data('copied', true);
          createSelectFilter(ui.item);
      }
  });
}

function plEditorBindUiEvents(){
  //Eventos ui
  $("#btnSave").click(function(){

    plSelected.clips = [];
    $.each($( "#playlist li" ), function(idx,clip){
        plSelected.clips.push($(clip).data("clip"));
    });

    socket.emit("playlistChanged",plSelected );
  });


  //Play now
  $("#btnPlay").click(function(){

    plSelected.clips = [];
    $.each($( "#playlist li" ), function(idx,clip){
        plSelected.clips.push($(clip).data("clip"));
    });
    socket.emit("play",plSelected );
  });

  $("#btnClearAll").click(function(){
    alert("todavía no anda gato XD");
  });

  $("#btnAdd_playlist").click(function(){
    var pl =
    {
      "id":"0",
      "name": $("#newPlaylist_name").val(),
      "clips":[]
    }
    socket.emit("playlistAdd",pl);
  });

}

function plEditorInitSocket(){
  //creo el select de filtros para los clip de la playlist

	socket= io.connect('http://localhost:3002');
	// Add a connect listener
	socket.on('connect',function() {
		console.log('Client has connected to the server!');
		// Sends a message to the server via sockets
	});
	//escucha por los datos de filtros
	socket.on('lstFilter',function(data) {

		lstFilter = data;
	});


	//Escucha por los datos de la playlist
	socket.on ("plList",function(data){
    console.log(data);
		if(data){
				renderPlaylists(data);
		}
	});

  //Escucha por los datos de la playlist
	socket.on ("plGetById_result",function(pl){
    console.log(pl);
		if(pl){
				renderPl(pl);
		}
	});


	//Escucha por los datos de los clips
	socket.on ("mediaList",function(lstClip){
		if(lstClip){
				lstClip = lstClip;

				//elimino lista de clips
				$("#lstClip li").remove();
				//ordeno la lista de clips
				//var clips = lstClip.sort(function(a, b){return a.order> b.order});


				//creo un li por cada clip
				$.each(lstClip, function(idx,clip){
					$("#lstClip").append($("<li>",{"id":clip.id,"class":"ui-state-default", "style":"z-index:1000"}).html(renderClip(clip)).data("clip", clip));
				});
		}
	});
	// Add a disconnect listener
	socket.on('disconnect',function() {
		console.log('The client has disconnected!');
	});
}



$("document").ready(function(){

  initSortables();

  plEditorBindUiEvents();

  plEditorInitSocket();

})
