import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit {
  private map!: Map;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      this.getUserLocation();
    }
  }

  private initMap(): void {
    this.map = new Map({
      target: 'map', // The ID of the HTML element to render the map
      layers: [
        new TileLayer({
          source: new OSM() // Using OpenStreetMap as the base layer
        })
      ],
      view: new View({
        center: [0, 0], // Set the initial center coordinates (in EPSG:3857)
        zoom: 2 // Initial zoom level
      })
    });
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.setMapCenter(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location: ", error);
          // Handle error, e.g., default to a fixed location
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Handle the case where geolocation is not supported
    } 
  }

  private setMapCenter(latitude: number, longitude: number): void {
    const coords = this.convertLatLngToEPSG3857(latitude, longitude);
    this.map.getView().setCenter(coords);
    this.map.getView().setZoom(12); // Adjust zoom level as needed
  }

  private convertLatLngToEPSG3857(lat: number, lon: number): number[] {
    const x = lon * 20037508.34 / 180;
    const y = Math.log(Math.tan((45 + lat / 2) * Math.PI / 180)) / (Math.PI / 180) * 20037508.34 / 180;
    return [x, y];
  }
}
