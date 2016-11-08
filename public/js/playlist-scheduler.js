
    function initFullCalendar(){
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
          drop: function(date, allDay) {
            console.log(date);
            console.log(allDay);

            $("#calendar").fullCalendar( 'renderEvent', {
              title: "se puede",
              start: date,
              end: date,
              playlist: null
            });

          },
          eventRender: function(event, element) {
            console.log(event);
            console.log(element);
              console.log(event.clip);

            //element.append($("<select>",{"class":"form-control"}));
            /*
              element.qtip({
                  content: event.description
              });
              */
          }
        });
    }

    $("document").ready(function(){

      initFullCalendar();

      //creo listas ordenables y dropeables.
      $( "#lstPlaylist" ).sortable().disableSelection();


      //Escucha por los datos de la playlist
      socket.on ("schList",function(data){
        if(data){

              $("#calendar").fullCalendar( 'renderEvent', {
                title: clip.name,
                start: new Date(),
                end: new Date().setHours((new Date()).getHours() + 1 ),
                clip: clip
              });

        }
      });

      //Escucha por los datos de los clips
      socket.on ("plList",function(lstClip,clipDirectory){
        if(lstClip){
            lstClip = lstClip;
            //elimino lista de clips
            $("#lstPlaylist li").remove();

            //ordeno la lista de clips
            var clips = lstClip.sort(function(a, b){return a.order> b.order});

            //creo un li por cada clip
            $.each(clips, function(idx,clip){

              $("#lstPlaylist").append($("<li>",{"id":clip.id,"class":"external-event", "style":"z-index:1000"}).html("<span class='glyphicon glyphicon-facetime-video' aria-hidden='true'></span> "+clip.name).data("clip", clip));

              $("#lstPlaylist li").draggable({
                zIndex: 999,
                revert: true,      // will cause the event to go back to its
                revertDuration: 0  //  original position after the drag
              });
            });
        }
      });


      //Eventos ui
      $("#btnSave_scheduler").click(function(){

        alert("save");

      });



    })
