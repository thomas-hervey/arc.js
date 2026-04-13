import { _LineString } from './line-string.js';
import type { GeoJSONFeature } from './types.js';
import type { Position } from 'geojson';

/**
 * Arc class representing the result of great circle calculations
 *
 * @param properties - Optional properties object
 *
 * @example
 * ```typescript
 * const gc = new GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
 * const arc = gc.Arc(3);
 * console.log(arc.json());
 * // { type: 'Feature', geometry: { type: 'LineString', coordinates: [[-122, 48], [-99.5, 43.5], [-77, 39]] }, properties: {} }
 * ```
 */
export class Arc {
    public properties: Record<string, any> = {};
    public geometries: _LineString[] = [];

    constructor(properties?: Record<string, any>) {
        if (properties) this.properties = properties;
    }

    /**
     * Convert to GeoJSON Feature
     *
     * @returns GeoJSON Feature with LineString or MultiLineString geometry
     *
     * @example
     * ```typescript
     * const gc = new GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
     * const arc = gc.Arc(3);
     * console.log(arc.json());
     * // { type: 'Feature', geometry: { type: 'LineString', coordinates: [[-122, 48], [-99.5, 43.5], [-77, 39]] }, properties: {} }
     * ```
     */
    json(): GeoJSONFeature {
        // Handle empty case
        if (this.geometries.length === 0) {
            return {
                type: 'Feature',
                // NOTE: coordinates: null is non-standard GeoJSON (RFC 7946 specifies empty array []) but maintained for backward compatibility with original arc.js behavior.
                geometry: { type: 'LineString', coordinates: null as any },
                properties: this.properties
            };
        }

        // Handle single LineString — index 0 is guaranteed by the length === 1 check above.
        if (this.geometries.length === 1) {
            return {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: this.geometries[0]!.coords },
                properties: this.properties
            };
        }

        // Handle multiple LineStrings as MultiLineString
        const coordinates: Position[][] = this.geometries.map(geom => geom.coords);

        return {
            type: 'Feature',
            geometry: { type: 'MultiLineString', coordinates },
            properties: this.properties
        };
    }

    /**
     * Convert to WKT (Well Known Text) format
     *
     * @returns WKT string representation
     *
     * @example
     * ```typescript
     * const gc = new GreatCircle({x: -122, y: 48}, {x: -77, y: 39});
     * const arc = gc.Arc(3);
     * console.log(arc.wkt());
     * // 'LINESTRING(-122 48,-99.5 43.5,-77 39)'
     * ```
     */
    wkt(): string {
        if (this.geometries.length === 0) {
            return '';
        }

        const wktParts: string[] = [];

        for (const geometry of this.geometries) {
            if (geometry.coords.length === 0) {
                wktParts.push('LINESTRING EMPTY');
                continue;
            }

            const coordStrings = geometry.coords.map(coord => `${coord[0]} ${coord[1]}`);
            wktParts.push(`LINESTRING(${coordStrings.join(',')})`);
        }

        return wktParts.join('; ');
    }
}
