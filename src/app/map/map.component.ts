import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorImageLayer from 'ol/layer/VectorImage';
import { Vector as VectorSource } from 'ol/source';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  private map!: Map;
  private latitude: number | null = null; // Property to store latitude
  private longitude: number | null = null; // Property to store longitude

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      this.getUserLocation();
    }
  }

  private initMap(): void {
    const osmLayer = new TileLayer({
      source: new OSM(),
    });

    const vectorLayer = new VectorImageLayer({
      source: new VectorSource({
        features: this.createFeatures(), // Create your features here
      }),
    });

    this.map = new Map({
      target: 'map',
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });
  }

  private createFeatures(): Feature[] {
    const features: Feature[] = [];
    
    if (this.latitude !== null && this.longitude !== null) {
      // Create a point feature from user location
      const point = new Point(fromLonLat([this.longitude, this.latitude]));
      const feature = new Feature(point);

      feature.setStyle(new Style({
        image: new Icon({
          src: 'assets/check.png', // Path to your marker icon
          scale: 1, // Adjust scale as needed
        }),
      }));
      features.push(feature);
    }

    return features;
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude; // Store latitude
          this.longitude = position.coords.longitude; // Store longitude
          this.setMapCenter(this.latitude, this.longitude);
        },
        (error) => {
          console.error('Error getting location: ', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  private setMapCenter(latitude: number, longitude: number): void {
    const coords = fromLonLat([longitude, latitude]);
    if (this.map) {
      this.map.getView().setCenter(coords);
      this.map.getView().setZoom(18);
      this.map.addLayer(new VectorImageLayer({
        source: new VectorSource({
          features: this.createFeatures(), // Create features after setting coordinates
        }),
      }));
    }
  }
}
