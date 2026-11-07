import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { InventorySectionComponent } from './inventory-section/inventory-section.component';
import { IncomingStockSectionComponent } from './incoming-stock-section/incoming-stock-section.component';
import { OverviewSectionComponent } from './overview-section/overview-section.component';
import { SalesSectionComponent } from './sales-section/sales-section.component';

@NgModule({ declarations: [AppComponent, InventorySectionComponent, IncomingStockSectionComponent, OverviewSectionComponent, SalesSectionComponent], imports: [BrowserModule, FormsModule], providers: [], bootstrap: [AppComponent] })
export class AppModule { }
