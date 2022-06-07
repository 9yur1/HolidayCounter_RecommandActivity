package com.example.holidaycounter;

import androidx.annotation.Dimension;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.graphics.Point;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.Display;
import android.widget.TextView;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.io.IOException;

public class MainActivity extends AppCompatActivity {
    TextView todayDate;
    TextView dateName;
    TextView locDate;
    TextView leftDate;
    TextView title;
    String url = "http://www.holidaycounter.ml:8080/app";
    String msg;
    final Bundle bundle = new Bundle();

    int standardSize_X, standardSize_Y;
    float density;

    public void getStandardSize() {
        Point ScreenSize = getScreenSize(this);
        density  = getResources().getDisplayMetrics().density;

        standardSize_X = (int) (ScreenSize.x / density);
        standardSize_Y = (int) (ScreenSize.y / density);
    }

    public Point getScreenSize(Activity activity) {
        Display display = activity.getWindowManager().getDefaultDisplay();
        Point size = new Point();
        display.getSize(size);

        return  size;
    }



    Handler handler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            Bundle bundle = msg.getData();
            String[] data = bundle.getString("message").split(",");
            todayDate.setText(data[0]);
            dateName.setText(data[1]);
            locDate.setText(data[2].substring(0, 4) + "년 " + data[2].substring(4, 6) + "월 " + data[2].substring(6) + "일");
            if(data[3].equals("0")) {
                leftDate.setTextSize(Dimension.SP, 70);
                leftDate.setText("D - DAY");
            }
            else {
                leftDate.setTextSize(Dimension.SP, 90);
                leftDate.setText("D - " + data[3]);
            }

        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ActionBar actionBar = getSupportActionBar();
        actionBar.hide();
        todayDate = findViewById(R.id.todayDate);
        dateName = findViewById(R.id.dateName);
        locDate = findViewById(R.id.locDate);
        leftDate = findViewById(R.id.leftDate);
        title = findViewById(R.id.title);

        new Thread() {
            public void run() {
                Document doc = null;
                try {
                    doc = Jsoup.connect(url).get();
                    Element elements = doc.select("body").first();
                    msg = elements.text();
                    bundle.putString("message", msg);
                    Message msg = handler.obtainMessage();
                    msg.setData(bundle);
                    handler.sendMessage(msg);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }.start();
    }

}