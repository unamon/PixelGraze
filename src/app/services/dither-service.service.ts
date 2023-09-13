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
            this.atkinson(i, error, limX);
            break;
          case "Ninke":
            this.JJN(i, error, limX);
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
  
  private atkinson(i: number, error: number, limX: number) {
    if (!this.data) return
    
    let right1 = i + 4 < this.data.length ? i + 4 : false;
    let right2 = i + 8 < this.data.length ? i + 8 : false;
    let botleft = i + limX * 4 - 4
    let bot = i + limX * 4
    let botright = i + limX * 4 + 4 < this.data.length ? i + limX * 4 + 4 : false
    let bot2 = i + limX * 4 * 2 < this.data.length ? i + limX * 4 * 2 : false

    if (right1)   this.errorSpread(right1, error, 1, 8)
    if (right2)   this.errorSpread(right2, error, 1, 8)
    if (botleft)  this.errorSpread(botleft, error, 1, 8)
    if (bot)      this.errorSpread(bot, error, 1, 8)
    if (botright) this.errorSpread(botright, error, 1, 8)
    if (bot2)     this.errorSpread(bot2, error, 1, 8)
  }

  private JJN(i: number, error: number, limX: number) {
    if (!this.data) return

    let r1   = i + 4 < this.data.length ? i + 4 : false;
    let r2   = i + 8 < this.data.length ? i + 8 : false;
    let l2b1 = i + limX * 4 - 8
    let l1b1 = i + limX * 4 - 4
    let b1   = i + limX * 4
    let r1b1 = i + limX * 4 + 4 < this.data.length ? i + limX * 4 + 4 : false
    let r2b1 = i + limX * 4 + 8 < this.data.length ? i + limX * 4 + 8 : false
    let l2b2 = i + limX * 4 * 2 - 8
    let l1b2 = i + limX * 4 * 2 - 4
    let b2   = i + limX * 4 * 2
    let r1b2 = i + limX * 4 + 2 + 4 < this.data.length ? i + limX * 4 * 2 + 4 : false
    let r2b2 = i + limX * 4 + 2 + 8 < this.data.length ? i + limX * 4 * 2 + 8 : false

    if (r1)   this.errorSpread(r1, error, 7, 48)
    if (r2)   this.errorSpread(r2, error, 7, 48)
    if (l2b1) this.errorSpread(l2b1, error, 7, 48)
    if (l1b1) this.errorSpread(l1b1, error, 7, 48)
    if (b1)   this.errorSpread(b1, error, 7, 48)
    if (r1b1) this.errorSpread(r1b1, error, 7, 48)
    if (r2b1) this.errorSpread(r2b1, error, 7, 48)
    if (l2b2) this.errorSpread(l2b2, error, 7, 48)
    if (l1b2) this.errorSpread(l1b2, error, 7, 48)
    if (b2)   this.errorSpread(b2, error, 7, 48)
    if (r1b2) this.errorSpread(r1b2, error, 7, 48)
    if (r2b2) this.errorSpread(r2b2, error, 7, 48)

  }

  private errorSpread(pixel: number, error: number, errorQuoeficient:number, quantaSize:number) { 
    if (!this.data) return //turning this into an error is probably redundant

    let average = Math.floor((this.data[pixel] + this.data[pixel + 1] + this.data[pixel + 2]) / 3)

    this.data[pixel] = Math.floor((average + (error * errorQuoeficient / quantaSize)))
    this.data[pixel + 1] = Math.floor((average + (error * errorQuoeficient / quantaSize)))
    this.data[pixel + 2] = Math.floor((average + (error * errorQuoeficient / quantaSize)))
  }


}
