import { AfterViewInit, Component, ElementRef, OnInit, Optional, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit{
  title = 'PixelGraze';

  
  @ViewChild("canvas") canvasView: ElementRef<HTMLCanvasElement> | undefined;
  canvas: HTMLCanvasElement | undefined;
  ctx: CanvasRenderingContext2D | undefined;
  imageData: ImageData | undefined;

  @ViewChild("image") imageView: ElementRef<HTMLImageElement> | undefined 
  image: HTMLImageElement | undefined;

  fileReader = new FileReader();
  
  file:File | null = null;
  
  //open file
  //pass file to canvas imageData
  //modify imageData, then pass it back to canvas
  //display canvas
  
  constructor() {}

  ngAfterViewInit(): void {
    this.canvas = this.canvasView?.nativeElement
    this.ctx = this.canvas?.getContext("2d")!
    this.image = this.imageView?.nativeElement
  }

  onFileSelected(event:any) { 
   this.loadFileIntoImageSrc(event.target.files[0])
   //now that our img src points to the uploaded file, we pass it to the canvas for transform into ImageData
   this.drawImageIntoCanvasToSaveData()
   //now our imageData has all the goodies needed for bit manipulation
  }

  loadFileIntoImageSrc(file:File) { 
    this.file = file
    if (this.file) { 
      this.fileReader.readAsDataURL(this.file)
    }

    this.fileReader.onload = (event) => { 
      this.image!.src = event.target!.result as string
    }
  }

  drawImageIntoCanvasToSaveData() { 
    this.image!.onload = () => { //actually surprised that this works
      if (this.canvas && this.ctx && this.image) {
        this.canvas.height = this.image.height
        this.canvas.width = this.image.width
  
        this.ctx.drawImage(this.image, 0, 0)
        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      }
      console.log(this.image?.height)
    }
  }
}
