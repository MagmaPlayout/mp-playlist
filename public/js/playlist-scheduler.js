var scheduler = null;

//init del plugin fullcalendar
function initFullCalendar(callback){
    $('#calendar').fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'agendaDay'
      },
      //slotDuration: '00:01:00',
      //snapDuration: '00:05:00',
      //snapMinutes  : '00:10:00',
      //slotMinutes: 1,
      defaultTimedEventDuration: '00:30:00',
      forceEventDuration: true,
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
          plId : pl.id

        };

        $("#calendar").fullCalendar( 'renderEvent', {
          title: ocurrence.name,
          start: date,
          end: date,
          ocurrence: ocurrence
        });

      }

    });

}

//crea un evento por cada ocurrence en el calendar
function renderOcurrenceEvents(){
  scheduler.ocurrences.forEach(function(item,index){
    console.log(item);
    $("#calendar").fullCalendar( 'renderEvent', {
      title: item.name,
      start: item.start,
      end: item.end,
      ocurrence: item
    });
  })

}

//renderiza lista de playlists
function plSchedulerRenderPlaylists(lstPl){
  if(lstPl){ $("#lstPlaylist li").remove();
  //creo un li por cada playlist
  $.each(lstPl, function(idx,item){
    $("#lstPlaylist").append($("<li>",{"id":item.id,"class":"external-event ui-state-default", "style":"z-index:1000"})
    .html("<span class='glyphicon glyphicon-facetime-video' aria-hidden='true'></span> "+item.name).data("playlist", item));
    $("#lstPlaylist li").draggable(
      {
        zIndex: 999,
        revert: true,
       });
     });
   }
 }

//declara los canales escuchados en socket
function initSocketChannels(){

  //Escucha por los datos del scheduler
  socket.on ("schData",function(sch){

    scheduler = sch;

  });


  //Escucha por la lista de playlist
  socket.on ("plList",function(lstPl,clipDirectory){

    plSchedulerRenderPlaylists(lstPl);

  });

}

// setea lista de ocurrence en el scheduler
function setSchedulerOcurrences(){
  //var d = $.deffered();
  var events = $('#calendar').fullCalendar('clientEvents');
  scheduler.ocurrences = [];
  events.forEach(function(item,idx){
    var ocurrence = {
      id:"",
      name: item.ocurrence.name,
      plId : item.ocurrence.plId,
      start : item.start.utcOffset("-03:00"),
      end : item.end.utcOffset("-03:00")
    };
    scheduler.ocurrences.push(ocurrence);
  });
}


//bindea eventos de la gui
function bindEvents(){
  //Eventos ui
  $("#btnSave_scheduler").click(function(){
    setSchedulerOcurrences();
    socket.emit("schedulerSave",scheduler );

  });

  $("#btnPlay_scheduler").click(function(){
    setSchedulerOcurrences();
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
