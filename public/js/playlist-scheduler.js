
var scheduler = null;

function initFullCalendar(callback){
    $('#calendar').fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'agendaDay'
      },
      defaultDate: new Date(),
      defaultView: 'agendaDay',
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      //eventLimit: true, // allow "more" link when too many events
      droppable: true, // this allows things to be dropped onto the calendar !!!
      dropAccept: '.external-event',
      drop: function(date, jsEvent, ui, resourceId ) {

        var pl = $(ui.helper).data("playlist");

        var ocurrence = {
          id:"",
          name: pl.name,
          plId : pl.id,
          start: date,
          end:date
        }
        scheduler.ocurrences.push(ocurrence);
        $("#calendar").fullCalendar( 'renderEvent', {
          title: ocurrence.name,
          start: ocurrence.start,
          end: ocurrence.end,
          ocurrence: ocurrence
        });

      }

    });

}

function renderOcurrenceEvents(){
  scheduler.ocurrences.forEach(function(item,index){
    $("#calendar").fullCalendar( 'renderEvent', {
      title: item.name,
      start: new Date(item.start),
      end: new Date(item.end),
      ocurrence: item
    });
  })

}

function initSocketChannels(){

  //Escucha por los datos del scheduler
  socket.on ("schData",function(sch){

    scheduler = sch;
    console.log($("#calendar"));
    //console.log(sch);
    if(sch){
      sch.ocurrences.forEach(function(item, idx){
        scheduler.ocurrences.push(
          {
            title: "item.name",
            start: new Date(),
            end: new Date().setHours((new Date()).getHours() + 1 ),
            ocurrence: item
          }
        );
      })
    }

  });


  //Escucha por los datos de la playlist
  socket.on ("plList",function(lstClip,clipDirectory){
    if(lstClip){
        lstClip = lstClip;
        //elimino lista de clips
        $("#lstPlaylist li").remove();

        //ordeno la lista de clips
        var clips = lstClip.sort(function(a, b){return a.order> b.order});

        //creo un li por cada clip
        $.each(clips, function(idx,item){

          $("#lstPlaylist").append($("<li>",{"id":item.id,"class":"external-event", "style":"z-index:1000"}).html("<span class='glyphicon glyphicon-facetime-video' aria-hidden='true'></span> "+item.name).data("playlist", item));

          $("#lstPlaylist li").draggable({
            zIndex: 999,
            revert: true,      // will cause the event to go back to its
            revertDuration: 0  //  original position after the drag
          });
        });
    }
  });

}

function bindEvents(){
  //Eventos ui
  $("#btnSave_scheduler").click(function(){
    socket.emit("schedulerSave",scheduler );

  });

  $("#btnPlay_scheduler").click(function(){
    socket.emit("schedulerPlay",scheduler );

  });


}


$("document").ready(function(){



  //creo listas ordenables y dropeables.
  $( "#lstPlaylist" ).sortable().disableSelection();

  initFullCalendar();

  initSocketChannels();

  bindEvents();



});
