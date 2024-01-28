import BaseEvent from "ol/events/Event";
import BaseLayer from "ol/layer/Base";
import { EventTypes, unByKey } from "ol/Observable";
import { Observable, Subscriber } from "rxjs";
import { Collection, Geolocation, Map } from "../../../../ol-module";

export function fromOpenLayerEvent<T>(element:BaseLayer|Collection<BaseLayer>|Map|Geolocation, eventName:string):Observable<T> {
   
    return new Observable( (observer:Subscriber<T>)  => {
      const handler = (e:T) => observer.next(e);
  
      let eventKey = element.on(eventName as EventTypes, handler as any)
  
      return () => {
        unByKey(eventKey)
      }
    });
  }