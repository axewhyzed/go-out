import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';

// The mapbox-gl.d.ts declaration file automatically adds the mapboxgl global variable.

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  private map!: mapboxgl.Map;
  private latitude: number | null = null;
  private longitude: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      this.getUserLocation();
    }
  }

  private initMap(): void {
    const apiKey = environment.mapboxApiKey; // Fetch the Mapbox API key from environment

    // Initialize the mapbox map
    this.map = new mapboxgl.Map({
      accessToken: apiKey,
      container: 'map', // ID of the div to hold the map
      style: 'mapbox://styles/mapbox/streets-v11', // Style of the map
      center: [0, 0], // Initial center [longitude, latitude]
      zoom: 2, // Initial zoom level
    });

    // Add a geolocate control to track user location
    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    }));

    // Add a marker once the map has loaded
    this.map.on('load', () => {
      if (this.latitude && this.longitude) {
        this.addMarker(this.latitude, this.longitude);
      }
    });
  }

  private addMarker(latitude: number, longitude: number): void {
    new mapboxgl.Marker()
      .setLngLat([longitude, latitude])
      .setPopup(new mapboxgl.Popup().setHTML('<p>You are here</p>'))
      .addTo(this.map);

    // Center the map to user's location
    this.map.setCenter([longitude, latitude]);
    this.map.setZoom(18); // Optional: Adjust zoom level
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          if (this.map) {
            this.addMarker(this.latitude, this.longitude);
          }
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

  public centerToUserLocation(): void {
    if (this.latitude !== null && this.longitude !== null && this.map) {
      this.addMarker(this.latitude, this.longitude);
    } else {
      console.warn('User location is not available.');
    }
  }
}
