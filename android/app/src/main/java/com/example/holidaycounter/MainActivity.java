package com.example.holidaycounter;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
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
    String url = "http://52.200.90.192:8080/app";
    String msg;
    final Bundle bundle = new Bundle();


    Handler handler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            Bundle bundle = msg.getData();
            String[] data = bundle.getString("message").split(",");
            todayDate.setText(data[0]);
            dateName.setText(data[1]);
            locDate.setText(Integer.parseInt(data[2].substring(4, 6)) + "월 " + Integer.parseInt(data[2].substring(6)) + "일");
            leftDate.setText("D-" + data[3]);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        todayDate = findViewById(R.id.todayDate);
        dateName = findViewById(R.id.dateName);
        locDate = findViewById(R.id.locDate);
        leftDate = findViewById(R.id.leftDate);
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