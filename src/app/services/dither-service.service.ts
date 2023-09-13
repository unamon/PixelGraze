import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DitherService {

  imageData:ImageData | undefined; 
  data: Uint8ClampedArray | undefined;
  ditherMethod: string = "Steinberg";

  constructor() { }

  loadImageData(newData:ImageData) {
    this.imageData = newData
    this.ditherize()
    return this.imageData
  }

  ditherize() {
    if (this.imageData == undefined) return
    this.data = this.imageData.data
    const limX = this.imageData.width
    const limY = this.imageData.height
    for (let y = 0; y < limY; y++) {
      for (let x = 0; x < limX; x++){
        let i = (y * limX + x) * 4
        // To monochrome
        let average = i == 0 ? Math.floor((this.data[i] + this.data[i + 1] + this.data[i + 2]) / 3) : this.data[i]
        // compare to threshold 
        let value = average > 127 ? 255 : 0 
        this.data[i] = value
        this.data[i + 1] = value
        this.data[i + 2] = value

        let error = average - value;

        switch (this.ditherMethod) {
          case "Steinberg":
            this.floydSteinberg(i, error, limX);
            break;
          case "Atkinson":
            break;
          case "Ninke":
            break;
          default:
            break;
        }
      }
    }
  }

  selectDitherMethod(method: string) { 
    this.ditherMethod = method
  }

  private floydSteinberg(i: number, error: number, limX: number) { 
    if (!this.data) return //make this into an actual error later on

    let rightPixel = i + 4 < this.data.length ? i + 4 : false;
    let downPixel = i + limX * 4 < this.data.length ? i + limX * 4 : false;
    let downLeftPixel = i + limX * 4 - 4
    let downRightPixel = i + limX * 4 + 4 < this.data.length ? i + limX * 4 + 4 : false;

    if (rightPixel)     this.errorSpread(rightPixel, error, 7, 16)
    if (downPixel)      this.errorSpread(downPixel, error, 5, 16)
    if (downRightPixel) this.errorSpread(downRightPixel, error, 1, 16)
    this.errorSpread(downLeftPixel, error, 3, 16)
  }

  private errorSpread(pixel: number, error: number, errorQuoeficient:number, quantaSize:number) { 
    if (!this.data) return //turning this into an error is probably redundant

    let average = Math.floor((this.data[pixel] + this.data[pixel + 1] + this.data[pixel + 2]) / 3)

    this.data[pixel] = Math.floor((average + (error * errorQuoeficient / quantaSize)))
    this.data[pixel + 1] = Math.floor((average + (error * errorQuoeficient / quantaSize)))
    this.data[pixel + 2] = Math.floor((average + (error * errorQuoeficient / quantaSize)))
  }


}
