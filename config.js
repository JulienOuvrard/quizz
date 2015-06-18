var take_the_tour = function () {
            var on_close = function () {
                $("#take_the_tour").show();
                window.localStorage['coco-toured'] = true;
            }
            // Start the tour!
            hopscotch.startTour( {
                id: "hello-coco",
                steps: [
                    {
                        title: "Bienvenue",
                        content: "Bienvenue sur ce site prototype. Il vous permettra de visionner des vidéos, de consulter des notes associées et de prendre vos propres notes.",
                        target: "header",
                        placement: "bottom"
                    },
                    {
                        title: "Saisie des notes",
                        content: "Pour saisir une note, synchronisée avec la vidéo, saisissez le texte dans cette zone et validez avec Entrée.",
                        target: ".Ldt-Widget[widget-type=CreateAnnotation]",
                        placement: "top"
                    },
                    {
                        title: "Notes - onglet",
                        content: "Vos notes personnelles seront présentées dans cette colonne à droite de la vidéo. Elles sont pour l'instant sauvegardées uniquement dans la mémoire de votre navigateur.",
                        target: "#tab",
                        placement: "left"
                    },
                    {
                        title: "Edition Quizz - onglet",
                        content: "Proposez vos propres questions, ou proposez une modfication d'une question déjà existante.",
                        target: "#tab",
                        placement: "left"
                    },
                    {
                        title: "Notes - publication",
                        content: "Vous pouvez choisir via un bouton apparaissant au survol de rendre une note publique. Elle sera alors visible de tous les utilisateurs dans l'onglet Notes publiques.",
                        target: "#tab",
                        placement: "left"
                    }

                  ],
                  showPrevButton: true,
                  zindex: 950,
                  showCloseButton: true,
                  onStart: function () {
                      $("#take_the_tour").hide();
                  },
                  onEnd: on_close,
                  onClose: on_close
              });
          };

            _myPlayer.on("trace-ready", function () {
                var tracer = tracemanager.get_trace("test");
                tracer.trace("PlayerStart", { url: document.URL });
                IriSP.jQuery(".TraceMe").on("mousedown mouseenter mouseleave", function(_e) {
                    tracer.trace('Mdp_' + _e.type,
                                 {
                                     "widget": "coco",
                                     "target": this.id
                                 });
                });
                document.addEventListener("visibilitychange", function() {
                    tracer.trace("VisibilityChange", {
                        "state": document.visibilityState,
                        "url": document.URL
                    });
                });

                if (! window.localStorage['coco-toured'])
                    window.setTimeout(take_the_tour, 2000);
            });
          document._myPlayer = _myPlayer;
          
          var name = localStorage.getItem('mla-username') || "Anonyme";
          $("#username").val(name)
          .on("blur", function () {
              set_username($("#username").val());
          });

          function generateUid () {
             return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
              });
          }
          
          var user_uuid = localStorage.getItem('mla-uuid') || generateUid();
          localStorage.setItem('mla-uuid', user_uuid);
          
          function set_username(u) {
              name = u;
              localStorage.setItem('mla-username', u);
              // Find CreateAnnotation widget and update creator_name
              _myPlayer.config.username = u;

              if (_myPlayer.widgets) {
                  var wid = _myPlayer.widgets.filter(function (w) { return w.type == "CreateAnnotation"; }).map( function (w) { w.creator_name = u; });
                  var wid2 = _myPlayer.widgets.filter(function (w) { return w.type == "Quizz"; }).map( function (w) { w.user = u; w.userid=user_uuid;});
              }
          };
          var get_tab_index = function (id) {
              var l = $("#tab > ul > li a").map(function (i, tab) { if (id == tab.getAttribute('href')) return i;})
              // Return 0 index if the id is not found
              return l[0] || 0;
          }
          var _tabs = $("#tab").tabs();
          _myPlayer.on("Annotation.create", function (a) {
              _tabs.tabs("option", "active", get_tab_index('#tab-contributions'));
          });
          _myPlayer.on("Annotation.publish", function (a) {
              _tabs.tabs("option", "active", get_tab_index('#tab-publiccontributions'));
              var wid = _myPlayer.widgets
                  .filter(function (w) { return w.type == "AnnotationsList"
                                         && w.annotation_type == "PublicContribution" })
                  .map( function (w) {
                      w.source.get();
                      w.source.onLoad( function () {
                          w.refresh();
                      });
                  });
          });
          $("#take_the_tour").click( function (e) {
              take_the_tour();
          });
            $(".popup_action").click( function (e) {
                $( "#" + this.getAttribute('id') + "_message" ).dialog({
                    modal: true,
                    minWidth: 400,
                    closeOnEscape: true,
                    buttons: {
                        Ok: function() {
                            $( this ).dialog( "close" );
                        }
                    }
                });
          });

        <!-- Piwik -->
          var _paq = _paq || [];
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);
          (function() {
          var u="//comin-ocw.org/analytics/";
          _paq.push(['setTrackerUrl', u+'piwik.php']);
          _paq.push(['setSiteId', 1]);
          var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
          g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
          })();
        <!-- End Piwik Code -->
          function on_resize() {
              IriSP.jQuery("[widget-type=Segments]").resize();
          }

          var splitter;
          _myPlayer.on("widgets-loaded", function () {
              set_username(name);
              splitter = $("#content").split({
                  orientation: 'vertical',
                  position: '66%',
                  limit: 100,
                  onDragEnd: function (e) {
                      on_resize();
                      return false;
                  }
              });
              window.setTimeout(function () { splitter.position('66%');
                                              on_resize(); }, 500);
          });