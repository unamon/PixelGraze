import { AfterViewInit, Component, ElementRef, OnInit, Optional, ViewChild } from '@angular/core';
import { DitherService } from './services/dither-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit{
  title = 'PixelGraze';
  
  ditherService: DitherService;
  ditherMethod: string = "Steinberg";

  @ViewChild("hiddenCanvas") hiddenCanvasView: ElementRef<HTMLCanvasElement> | undefined;
  hiddenCanvas: HTMLCanvasElement | undefined;
  hiddenCtx: CanvasRenderingContext2D | undefined;
  imageData: ImageData | undefined;

  @ViewChild("displayCanvas") displayCanvasView: ElementRef<HTMLCanvasElement> | undefined;
  displayCanvas: HTMLCanvasElement | undefined;
  displayCtx: CanvasRenderingContext2D | undefined;

  @ViewChild("image") imageView: ElementRef<HTMLImageElement> | undefined 
  image: HTMLImageElement | undefined;

  fileReader = new FileReader();
  file:File | null = null;
    
  constructor(ditherService:DitherService) {
    this.ditherService = ditherService;
  }

  ngAfterViewInit(): void {
    this.hiddenCanvas = this.hiddenCanvasView?.nativeElement
    this.hiddenCtx = this.hiddenCanvas?.getContext("2d")!
    this.displayCanvas = this.displayCanvasView?.nativeElement
    this.displayCtx = this.displayCanvas?.getContext("2d")!
    this.image = this.imageView?.nativeElement
  }

  onFileSelected(event:any) { 
   this.loadFileIntoImageSrc(event.target.files[0])
   this.displayCtx!.clearRect(0,0,this.displayCanvas!.width, this.displayCanvas!.height)

  } 

  doDither() {
     //now that our img src points to the uploaded file, we pass it to the canvas for transform into ImageData
     this.drawImageIntoCanvasToSaveData()
     //now our imageData has all the goodies needed for bit manipulation
     let newData = this.ditherService.loadImageData(this.imageData!)

     if(newData) this.renderImageData(newData)
  }

  onDitherMethodSelected(event:any) { 
    this.ditherMethod = event.target.value
    this.ditherService.selectDitherMethod(this.ditherMethod)
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
  
    if (this.hiddenCanvas && this.hiddenCtx && this.image) {
      this.hiddenCanvas.height = this.image.height
      this.hiddenCanvas.width = this.image.width
      this.hiddenCtx.drawImage(this.image, 0, 0)
      this.imageData = this.hiddenCtx.getImageData(0, 0, this.hiddenCanvas.width, this.hiddenCanvas.height)     
    }   
  }

  renderImageData(imageData: ImageData) {
    if(!this.displayCanvas||!this.displayCtx) return        

    this.displayCanvas.height = this.image!.height
    this.displayCanvas.width = this.image!.width
    
    this.displayCtx.clearRect(0,0,this.displayCanvas.width, this.displayCanvas.height)


    this.displayCtx.putImageData(imageData, 0, 0)
  }
}
