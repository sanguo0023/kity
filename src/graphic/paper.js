define( function ( require, exports, module ) {
    var Class = require( 'core/class' );
    var utils = require( 'core/utils' );
    var svg = require( 'graphic/svg' );
    var Container = require( 'graphic/container' );
    var ShapeContainer = require( 'graphic/shapecontainer' );
    var ViewBox = require( 'graphic/viewbox' );
    var EventHandler = require( 'graphic/eventhandler' );
    var Styled = require( 'graphic/styled' );
    var Matrix = require( 'graphic/matrix' );

    var Paper = Class.createClass( 'Paper', {

        mixins: [ ShapeContainer, EventHandler, Styled, ViewBox ],

        constructor: function ( container ) {
            this.callBase();

            this.node = this.createSVGNode();
            this.node.paper = this;

            this.node.appendChild( this.resourceNode = svg.createNode( 'defs' ) );
            this.node.appendChild( this.shapeNode = svg.createNode( 'g' ) );

            this.resources = new Container();
            this.setWidth( '100%' ).setHeight( '100%' );

            if ( container ) {
                this.renderTo( container );
            }
            this.callMixin();
        },

        renderTo: function ( container ) {
            if ( utils.isString( container ) ) {
                container = document.getElementById( container );
            }
            this.container = container;
            container.appendChild( this.node );
        },

        createSVGNode: function () {
            var node = svg.createNode( 'svg' );
            node.setAttribute( "xmlns", "http://www.w3.org/2000/svg" );
            node.setAttribute( "xmlns:xlink", "http://www.w3.org/1999/xlink" );
            return node;
        },

        getNode: function () {
            return this.node;
        },

        getContainer: function () {
            return this.container;
        },

        getWidth: function () {
            return +this.node.getAttribute( 'width' );
        },

        setWidth: function ( width ) {
            this.node.setAttribute( 'width', width );
            return this;
        },

        getHeight: function () {
            return +this.node.getAttribute( 'height' );
        },

        setHeight: function ( height ) {
            this.node.setAttribute( 'height', height );
            return this;
        },

        setViewPort: function ( cx, cy, zoom ) {
            var viewport, box;
            if ( arguments.length == 1 ) {
                viewport = arguments[ 0 ];
                cx = viewport.center.x;
                cy = viewport.center.y;
                zoom = viewport.zoom;
            }
            zoom = zoom || 1;
            box = this.getViewBox();

            var matrix = new Matrix();
            var dx = ( box.x + box.width / 2 ) - cx,
                dy = ( box.y + box.height / 2 ) - cy;
            matrix.translate( -cx, -cy );
            matrix.scale( zoom );
            matrix.translate( cx, cy );
            matrix.translate( dx, dy );
            this.shapeNode.setAttribute( 'transform', matrix );

            this.viewport = {
                center: {
                    x: cx,
                    y: cy
                },
                offset: {
                    x: dx,
                    y: dy
                },
                zoom: zoom
            };
            return this;
        },

        getViewPort: function () {
            if ( !this.viewport ) {
                var box = this.getViewBox();
                return {
                    zoom: 1,
                    center: {
                        x: box.x + box.width / 2,
                        y: box.y + box.height / 2
                    },
                    offset: {
                        x: 0,
                        y: 0
                    }
                };
            }
            return this.viewport;
        },

        addResource: function ( resource ) {
            this.resources.appendItem( resource );
            if ( resource.node ) {
                this.resourceNode.appendChild( resource.node );
            }


            return this;
        },

        removeResource: function ( resource ) {
            if ( resource.remove ) {
                resource.remove();
            }
            if ( resource.node ) {
                this.resourceNode.removeChild( resource.node );
            }
            return this;
        },

        getPaper: function () {
            return this;
        }
    } );

    var Shape = require( 'graphic/shape' );
    Class.extendClass( Shape, {
        getPaper: function () {
            var parent = this.container;
            while ( parent && parent instanceof Paper === false ) {
                parent = parent.container;
            }
            return parent;
        }
    } );
    return Paper;
} );