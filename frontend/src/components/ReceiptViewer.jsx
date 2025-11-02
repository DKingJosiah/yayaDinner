import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, ExternalLink, FileText, Download, Eye } from "lucide-react";

const ReceiptViewer = ({ submissionId, useReceiptImage, originalName = "receipt", onDemandOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(!onDemandOnly);
  
  const { data: receiptData, isLoading, error } = useReceiptImage(
    shouldFetch ? submissionId : null
  );

  const handleViewClick = () => {
    if (!shouldFetch) {
      setShouldFetch(true);
    }
    setIsOpen(true);
  };

  const handleDownload = () => {
    if (!receiptData?.dataUrl) return;

    const link = document.createElement('a');
    link.href = receiptData.dataUrl;
    link.download = receiptData.originalName || `${originalName}.${receiptData.mimeType?.split('/')[1] || 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewInNewTab = () => {
    if (!receiptData?.dataUrl) return;
    
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receiptData.originalName}</title>
          <style>
            body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif; }
            .container { max-width: 100%; text-align: center; }
            img, embed { max-width: 100%; height: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .info { margin-bottom: 20px; padding: 10px; background: white; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="info">
              <h2>Receipt: ${receiptData.originalName}</h2>
              <p>Size: ${(receiptData.size / 1024).toFixed(1)} KB | Type: ${receiptData.mimeType}</p>
            </div>
            ${receiptData.mimeType === 'application/pdf' 
              ? `<embed src="${receiptData.dataUrl}" type="application/pdf" width="100%" height="800px" />`
              : `<img src="${receiptData.dataUrl}" alt="Receipt" />`
            }
          </div>
        </body>
      </html>
    `);
  };

  if (error) {
    return (
      <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <FileText className="w-4 h-4 text-destructive" />
        <div>
          <span className="text-xs font-medium text-destructive block">Receipt</span>
          <p className="text-sm text-destructive">Failed to load receipt</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 px-3 text-xs border-gold/30 hover:border-gold hover:bg-gold/10"
            disabled={isLoading}
            onClick={handleViewClick}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 mr-1" />
                View
              </>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Receipt: {receiptData?.originalName || 'Loading...'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : receiptData ? (
              <div className="space-y-4">
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={handleViewInNewTab}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                <div className="border rounded-lg overflow-hidden bg-white">
                  {receiptData.mimeType === 'application/pdf' ? (
                    <embed
                      src={receiptData.dataUrl}
                      type="application/pdf"
                      width="100%"
                      height="600px"
                      className="border-0"
                    />
                  ) : (
                    <img
                      src={receiptData.dataUrl}
                      alt="Receipt"
                      className="w-full h-auto max-h-[600px] object-contain"
                    />
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground text-center">
                  <p>File: {receiptData.originalName}</p>
                  <p>Size: {(receiptData.size / 1024).toFixed(1)} KB | Type: {receiptData.mimeType}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Receipt not available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptViewer;